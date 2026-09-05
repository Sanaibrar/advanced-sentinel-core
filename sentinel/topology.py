"""Device Relationship and Topology Mapping module."""

def build_topology(local_ip: str, devices: list) -> dict:
    """Build a simple star-topology mapping rooted at the local gateway/router."""
    # Assuming standard gateway IP ends in .1 (e.g., 192.168.1.1)
    ip_parts = local_ip.split(".")
    gateway_ip = f"{ip_parts[0]}.{ip_parts[1]}.{ip_parts[2]}.1"
    
    topology = {
        "gateway": gateway_ip,
        "connected_nodes": []
    }
    
    for device in devices:
        dev_ip = device.get("ip")
        dev_mac = device.get("mac")
        if dev_ip != gateway_ip:
            topology["connected_nodes"].append({
                "ip": dev_ip,
                "mac": dev_mac,
                "relation": "Directly connected to Gateway"
            })
            
    return topology