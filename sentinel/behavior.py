"""Behavioral Baseline Learning module."""

import os
import json

BASELINE_FILE = "device_baseline.json"

def update_baseline(devices: list) -> int:
    """Learn and maintain normal device presence baseline over time."""
    baseline = {}
    if os.path.exists(BASELINE_FILE):
        try:
            with open(BASELINE_FILE, "r", encoding="utf-8") as f:
                baseline = json.load(f)
        except (json.JSONDecodeError, OSError):
            baseline = {}
            
    for dev in devices:
        ip = dev.get("ip")
        mac = dev.get("mac")
        if ip not in baseline:
            baseline[ip] = {"mac": mac, "frequency": 1}
        else:
            baseline[ip]["frequency"] += 1
            
    try:
        with open(BASELINE_FILE, "w", encoding="utf-8") as f:
            json.dump(baseline, f, indent=2)
    except OSError:
        pass
        
    return len(baseline)