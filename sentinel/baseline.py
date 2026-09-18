import datetime
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASELINE_FILE = os.path.join(BASE_DIR, "device_baseline.json")

def load_baseline():
    if os.path.exists(BASELINE_FILE):
        with open(BASELINE_FILE, "r") as f:
            return json.load(f)
    return {}

def save_baseline(data):
    with open(BASELINE_FILE, "w") as f:
        json.dump(data, f, indent=2)

def analyze_behavior(discovered_devices):
    """
    Tracks active hours and detects behavioral anomalies or baseline shifts.
    """
    baseline = load_baseline()
    current_hour = datetime.datetime.now().hour
    current_time = datetime.datetime.now().isoformat()
    updated_events = []

    for device in discovered_devices:
        mac = device["mac"]
        ip = device["ip"]

        if mac not in baseline:
            # First time seeing device - establish initial baseline
            baseline[mac] = {
                "first_seen": current_time,
                "typical_hours": [current_hour],
                "status": "Trusted (Learning)",
                "anomaly_score": 0
            }
        else:
            dev_info = baseline[mac]
            hours = dev_info.get("typical_hours", [])
            
            # Check if active during an unusual hour (e.g., late night activity)
            if current_hour not in hours:
                if len(hours) < 5: # Learn new normal hours during initial phase
                    hours.append(current_hour)
                    dev_info["status"] = "Baseline Updating"
                else:
                    # Behavioral Anomaly Detected!
                    dev_info["anomaly_score"] = dev_info.get("anomaly_score", 0) + 1
                    dev_info["status"] = "Behavioral Anomaly (Unusual Hour)"
                    updated_events.append({
                        "type": "behavioral_anomaly",
                        "ip": ip,
                        "mac": mac,
                        "risk_level": "MEDIUM",
                        "timestamp": current_time,
                        "message": f"Device {mac} active outside typical hours at {ip}"
                    })
            else:
                dev_info["status"] = "Normal (Baseline Matched)"

            dev_info["typical_hours"] = hours

    save_baseline(baseline)
    return updated_events, baseline