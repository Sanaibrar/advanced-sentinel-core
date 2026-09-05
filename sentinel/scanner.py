"""ARP-based device discovery using Scapy.

Requires elevated privileges to send raw ARP packets:
  - Windows: run terminal as Administrator (and have Npcap installed)
  - Linux/macOS: run with sudo (or grant CAP_NET_RAW)
"""

from scapy.all import ARP, Ether, srp


def arp_scan(network_cidr: str, timeout: int = 3):
    """Send an ARP 'who-has' broadcast over network_cidr.

    Returns a list of dicts: [{"ip": "...", "mac": "..."}, ...]
    """
    arp_request = ARP(pdst=network_cidr)
    broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
    packet = broadcast / arp_request

    answered, _ = srp(packet, timeout=timeout, verbose=False)

    devices = []
    for _, received in answered:
        devices.append({
            "ip": received.psrc,
            "mac": received.hwsrc.lower(),
        })
    return devices
