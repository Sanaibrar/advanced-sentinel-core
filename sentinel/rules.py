"""Defensive Rule Enforcer and Countermeasures module."""

def enforce_defensive_rules(events: list) -> list:
    """Evaluate events and apply active defensive rules or mitigation actions."""
    enforced_actions = []
    
    for event in events:
        risk = event.get("risk_level", "LOW")
        event_type = event.get("type")
        action = "None required"
        
        if risk == "HIGH":
            action = f"QUARANTINE_RECOMMENDED: Isolate MAC {event.get('mac', event.get('old_mac'))} immediately."
        elif risk == "MEDIUM":
            action = f"MONITOR_STRICTLY: Log increased watch on IP {event.get('ip')}."
        else:
            action = "PASS: Routine telemetry."
            
        event["defensive_action"] = action
        enforced_actions.append(event)
        
    return enforced_actions