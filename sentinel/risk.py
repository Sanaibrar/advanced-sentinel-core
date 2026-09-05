"""Risk Correlation Engine module."""

def correlate_risk(events: list) -> list:
    """Analyze events and assign risk severities."""
    correlated_events = []
    
    for event in events:
        event_type = event.get("type")
        risk_level = "LOW"
        description = "Routine network observation."
        
        if event_type == "new_device":
            risk_level = "MEDIUM"
            description = "Unidentified new device joined the subnet. Verify authorization."
        elif event_type in ["ip_changed", "mac_changed"]:
            risk_level = "HIGH"
            description = "Potential ARP spoofing or dynamic IP/MAC alteration detected."
            
        event["risk_level"] = risk_level
        event["description"] = description
        correlated_events.append(event)
        
    return correlated_events