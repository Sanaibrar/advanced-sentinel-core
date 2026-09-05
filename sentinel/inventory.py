"""Device inventory persistence (IP <-> MAC) and change detection."""

import json
import os
from datetime import datetime, timezone

STATE_FILE = "device_state.json"


def load_state(path: str = STATE_FILE) -> dict:
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def save_state(state: dict, path: str = STATE_FILE) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def diff_and_update(current_devices: list, state: dict, path: str = STATE_FILE):
    """Compare freshly scanned devices against saved state.

    Returns (events, updated_state) where events is a list of dicts:
      {"type": "new_device" | "ip_changed" | "mac_changed", "ip":..., "mac":..., "old":...}
    """
    events = []
    now = datetime.now(timezone.utc).isoformat()

    mac_to_ip = {v["mac"]: k for k, v in state.items()}

    for device in current_devices:
        ip, mac = device["ip"], device["mac"]

        if ip not in state:
            if mac in mac_to_ip:
                # Same device (MAC known) but got a new IP
                old_ip = mac_to_ip[mac]
                events.append({
                    "type": "ip_changed",
                    "mac": mac,
                    "old_ip": old_ip,
                    "new_ip": ip,
                    "time": now,
                })
                if old_ip in state:
                    del state[old_ip]
            else:
                events.append({
                    "type": "new_device",
                    "ip": ip,
                    "mac": mac,
                    "time": now,
                })
        else:
            known_mac = state[ip]["mac"]
            if known_mac != mac:
                events.append({
                    "type": "mac_changed",
                    "ip": ip,
                    "old_mac": known_mac,
                    "new_mac": mac,
                    "time": now,
                })

        state[ip] = {"mac": mac, "last_seen": now}

    save_state(state, path)
    return events, state
def calculate_health_score(events: list) -> int:
    """Calculate network health score (0-100) based on detected anomalies."""
    score = 100
    for event in events:
        if event["type"] == "new_device":
            score -= 10  # Unidentified new device penalty
        elif event["type"] in ["ip_changed", "mac_changed"]:
            score -= 25  # High security risk penalty for ARP anomalies
    return max(0, score)