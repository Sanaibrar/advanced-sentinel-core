"""Detect the local machine's IPv4 address and derive a /24 scan range.

Note: We assume a /24 subnet mask, which covers the vast majority of
home and small-office networks. If your network uses a different mask,
edit SUBNET_CIDR_BITS below.
"""

import socket
import ipaddress

SUBNET_CIDR_BITS = 24


def get_local_ip() -> str:
    """Return this machine's primary local IPv4 address.

    Uses a UDP 'connect' trick (no packets actually sent) to ask the OS
    which local interface would be used to reach an external address.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def get_scan_network(local_ip: str = None) -> str:
    """Return a CIDR string (e.g. '192.168.1.0/24') to ARP-scan."""
    if local_ip is None:
        local_ip = get_local_ip()
    iface = ipaddress.IPv4Interface(f"{local_ip}/{SUBNET_CIDR_BITS}")
    return str(iface.network)


if __name__ == "__main__":
    ip = get_local_ip()
    net = get_scan_network(ip)
    print(f"Local IP     : {ip}")
    print(f"Scan Network : {net}")
