"""Executive Security Report Exporter module."""

import json
import os
from datetime import datetime, timezone

REPORT_FILE = "security_report.json"

def generate_report(health_score: int, topology: dict, events: list) -> dict:
    """Generate and save an executive security summary report."""
    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "network_health_score": health_score,
        "gateway": topology.get("gateway"),
        "total_connected_nodes": len(topology.get("connected_nodes", [])),
        "detected_events_count": len(events),
        "events": events
    }
    
    try:
        with open(REPORT_FILE, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
    except OSError:
        pass
        
    return report