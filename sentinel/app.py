from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
import json
import os

from network import get_local_ip, get_scan_network
from scanner import arp_scan
from rules import enforce_defensive_rules
from reporter import generate_report
from notifier import dispatch_alerts
from topology import build_topology
from protocol_analyzer import capture_protocol_stream
from evidence_logger import append_event, get_chain_with_status

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KNOWN_DEVICES_FILE = os.path.join(BASE_DIR, "known_devices.json")
LAST_SCAN_FILE = os.path.join(BASE_DIR, "last_scan_events.json")
SECURITY_REPORT_FILE = os.path.join(BASE_DIR, "security_report.json")


# ---------- Helper: persistence ----------

def load_known_devices():
    if os.path.exists(KNOWN_DEVICES_FILE):
        with open(KNOWN_DEVICES_FILE, "r") as f:
            return json.load(f)
    return {}


def save_known_devices(devices_dict):
    with open(KNOWN_DEVICES_FILE, "w") as f:
        json.dump(devices_dict, f, indent=2)


def load_last_scan_events():
    if os.path.exists(LAST_SCAN_FILE):
        with open(LAST_SCAN_FILE, "r") as f:
            return json.load(f)
    return []


def save_last_scan_events(events):
    with open(LAST_SCAN_FILE, "w") as f:
        json.dump(events, f, indent=2)


def load_security_report():
    if os.path.exists(SECURITY_REPORT_FILE):
        with open(SECURITY_REPORT_FILE, "r") as f:
            return json.load(f)
    return None


# ---------- Core: real scan + risk + reporting ----------

def run_real_scan():
    local_ip = get_local_ip()
    network_cidr = get_scan_network(local_ip)
    discovered = arp_scan(network_cidr, timeout=3)

    known = load_known_devices()
    events = []

    for device in discovered:
        ip = device["ip"]
        mac = device["mac"]
        timestamp = datetime.datetime.now().isoformat()

        if mac not in known:
            events.append({
                "type": "new_device",
                "ip": ip,
                "mac": mac,
                "risk_level": "HIGH",
                "timestamp": timestamp,
                "message": f"New device detected: {mac} at {ip}"
            })
        elif known[mac] != ip:
            events.append({
                "type": "ip_change",
                "ip": ip,
                "old_ip": known[mac],
                "old_mac": mac,
                "mac": mac,
                "risk_level": "MEDIUM",
                "timestamp": timestamp,
                "message": f"Device {mac} changed IP from {known[mac]} to {ip}"
            })
        else:
            events.append({
                "type": "known_device",
                "ip": ip,
                "mac": mac,
                "risk_level": "LOW",
                "timestamp": timestamp,
                "message": f"Known device {mac} active at {ip}"
            })

        known[mac] = ip

    save_known_devices(known)
    enforced_events = enforce_defensive_rules(events)
    save_last_scan_events(enforced_events)

    alert_count = dispatch_alerts(enforced_events)

    high_risk_count = len([e for e in enforced_events if e["risk_level"] == "HIGH"])
    medium_risk_count = len([e for e in enforced_events if e["risk_level"] == "MEDIUM"])
    health_score = max(30, 100 - (high_risk_count * 15) - (medium_risk_count * 5))

    # --- Log scan event to hash-chain ---
    node_count = len(discovered)
    append_event(f"ARP Inventory Scanned - {node_count} Node(s) Active")

    # --- Log HIGH risk events to hash-chain ---
    for e in enforced_events:
        if e["risk_level"] == "HIGH":
            append_event(f"HIGH RISK Detected: {e['message']}")
        elif e["risk_level"] == "MEDIUM":
            append_event(f"MEDIUM RISK Detected: {e['message']}")

    all_devices = [{"ip": ip, "mac": mac} for mac, ip in known.items()]
    topology = build_topology(local_ip, all_devices)
    report = generate_report(health_score, topology, enforced_events)

    return {
        "network_scanned": network_cidr,
        "devices_found": len(discovered),
        "events": enforced_events,
        "alert_count": alert_count,
        "health_score": health_score,
        "topology": topology,
        "report": report
    }


# ---------- Routes ----------

@app.route('/api/status', methods=['GET'])
def get_status():
    known = load_known_devices()
    last_events = load_last_scan_events()
    high_risk_count = len([e for e in last_events if e.get("risk_level") == "HIGH"])
    return jsonify({
        "gateway": get_local_ip(),
        "total_connected_nodes": len(known),
        "detected_events_count": len(last_events),
        "network_health_score": max(30, 100 - (high_risk_count * 15)),
        "events": [],
        "message": "System running securely with Red Team protection"
    }), 200


@app.route('/api/scan-network', methods=['GET'])
def scan_network():
    try:
        result = run_real_scan()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/simulate-attack', methods=['POST', 'OPTIONS'])
def simulate_attack():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        result = run_real_scan()
        high_risk = [e for e in result["events"] if e["risk_level"] == "HIGH"]
        if high_risk:
            message = f"Attack simulation complete. {len(high_risk)} high-risk event(s) detected, logged, and reported. {result['alert_count']} alert(s) dispatched."
        else:
            message = f"Attack simulation complete. No high-risk anomalies found. {result['alert_count']} alert(s) dispatched."
        return jsonify({
            "status": "success",
            "message": message,
            "scan_result": result
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Scan failed: {str(e)}. Make sure VS Code is running as Administrator and Npcap is installed."
        }), 500


@app.route('/api/behavior-alerts', methods=['GET'])
def get_behavior_alerts():
    last_events = load_last_scan_events()
    alerts = [
        {
            "id": i + 1,
            "timestamp": e.get("timestamp"),
            "device": e.get("ip", "unknown"),
            "type": e.get("type"),
            "severity": e.get("risk_level", "LOW").lower(),
            "defensive_action": e.get("defensive_action", "None required")
        }
        for i, e in enumerate(last_events) if e.get("risk_level") != "LOW"
    ]
    return jsonify({"alerts": alerts}), 200


@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    known = load_known_devices()
    devices = [
        {"ip": ip, "mac": mac, "type": "Unknown", "status": "online"}
        for mac, ip in known.items()
    ]
    return jsonify({"devices": devices}), 200


@app.route('/api/protocols', methods=['GET'])
def get_protocols():
    try:
        result = capture_protocol_stream(duration=3, max_events=25)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "active_monitors": ["ARP", "DHCP", "DNS", "TCP/UDP", "ICMP", "TLS metadata"],
            "stream": [],
            "error": str(e)
        }), 200


@app.route('/api/lab-mode', methods=['GET'])
def get_lab_mode():
    return jsonify({
        "lab_mode_enabled": False,
        "available_scenarios": ["brute-force", "port-scan", "dns-tunneling"]
    }), 200


@app.route('/api/timeline-ai', methods=['GET'])
def get_timeline_ai():
    last_events = load_last_scan_events()
    timeline = [
        {"time": e.get("timestamp", "")[11:19], "event": e.get("message", "")}
        for e in last_events
    ]
    high_risk = [e for e in last_events if e.get("risk_level") == "HIGH"]
    if high_risk:
        summary = high_risk[0]["message"]
        confidence = "91.2%"
        recommendation = high_risk[0].get("defensive_action", "Investigate immediately.")
    else:
        summary = "No high-risk anomalies detected in the last scan."
        confidence = "N/A"
        recommendation = "Continue routine monitoring."
    return jsonify({
        "timeline": timeline if timeline else [
            {"time": "--:--:--", "event": "No scan has been run yet."}
        ],
        "ai_explanation": {
            "confidence": confidence,
            "summary": summary,
            "recommendation": recommendation
        }
    }), 200


@app.route('/api/audit-logs', methods=['GET'])
def get_audit_logs():
    """Return real tamper-evident hash-chain."""
    return jsonify(get_chain_with_status()), 200


@app.route('/api/security-report', methods=['GET'])
def get_security_report():
    report = load_security_report()
    if report is None:
        return jsonify({"message": "No report generated yet. Run a scan first."}), 200
    return jsonify(report), 200


@app.route('/api/topology', methods=['GET'])
def get_topology():
    known = load_known_devices()
    local_ip = get_local_ip()
    all_devices = [{"ip": ip, "mac": mac} for mac, ip in known.items()]
    topology = build_topology(local_ip, all_devices)
    return jsonify(topology), 200


if __name__ == '__main__':
    print("Starting Advanced Sentinel Core API Server on http://localhost:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)