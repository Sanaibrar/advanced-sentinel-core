"""Advanced Sentinel Core - V2 Final Master Entry Point."""

import time
import sys

from sentinel.network import get_local_ip, get_scan_network
from sentinel.scanner import arp_scan
from sentinel.inventory import load_state, diff_and_update, calculate_health_score
from sentinel.topology import build_topology
from sentinel.risk import correlate_risk
from sentinel.behavior import update_baseline
from sentinel.rules import enforce_defensive_rules
from sentinel.notifier import dispatch_alerts
from sentinel.reporter import generate_report
from sentinel.cli import parse_arguments
from sentinel.logger import get_logger

def run_once(logger):
    local_ip = get_local_ip()
    network = get_scan_network(local_ip)
    logger.info(f"Scanning network {network} (local IP: {local_ip})")

    devices = arp_scan(network)
    logger.info(f"Found {len(devices)} device(s) on the network")

    # Update behavioral baseline tracking
    baseline_count = update_baseline(devices)

    state = load_state()
    events, state = diff_and_update(devices, state)
    
    # Correlate risk severities for events
    events = correlate_risk(events)
    
    # Enforce defensive countermeasures & rules
    events = enforce_defensive_rules(events)
    
    # Dispatch security notifications for alerts
    alerts_dispatched = dispatch_alerts(events)

    for event in events:
        risk = event.get("risk_level", "LOW")
        desc = event.get("description", "")
        action = event.get("defensive_action", "")
        
        if event["type"] == "new_device":
            logger.warning(
                f"[{risk}] NEW DEVICE -> IP: {event['ip']} | MAC: {event['mac']} | {desc} | Action: {action}"
            )
        elif event["type"] == "ip_changed":
            logger.warning(
                f"[{risk}] ARP ANOMALY (IP) -> MAC: {event['mac']} "
                f"moved from {event['old_ip']} to {event['new_ip']} | {desc} | Action: {action}"
            )
        elif event["type"] == "mac_changed":
            logger.warning(
                f"[{risk}] ARP ANOMALY (MAC) -> IP: {event['ip']} "
                f"changed from {event['old_mac']} to {event['new_mac']} | {desc} | Action: {action}"
            )

    if not events:
        logger.info("No new devices or anomalies this cycle. Defensive posture secure.")

    # Calculate and display Network Health Score
    health_score = calculate_health_score(events)
    logger.info(f"Network Health Score: {health_score}/100")

    # Build and log Network Topology Mapping
    topology = build_topology(local_ip, devices)
    logger.info(f"Topology Gateway: {topology['gateway']} | Connected Nodes: {len(topology['connected_nodes'])} | Baseline Tracked: {baseline_count} devices | Alerts Sent: {alerts_dispatched}")

    # Generate Executive Security Report
    report = generate_report(health_score, topology, events)
    logger.info(f"Executive Security Report generated & saved (Events logged: {report['detected_events_count']})")

def main():
    args = parse_arguments()
    logger = get_logger()
    logger.info("Advanced Sentinel Core - V2 Fully Loaded Master Engine")

    try:
        if args.once:
            run_once(logger)
            logger.info("Single scan execution completed. Exiting.")
            sys.exit(0)

        while True:
            run_once(logger)
            logger.info(f"Sleeping {args.interval}s until next scan...")
            time.sleep(args.interval)
            
    except KeyboardInterrupt:
        logger.info("Stopped by user (Ctrl+C). Exiting.")
        sys.exit(0)
    except PermissionError:
        logger.error(
            "Permission denied sending ARP packets. "
            "Run this terminal as Administrator (Windows)"
        )
        sys.exit(1)

if __name__ == "__main__":
    main()