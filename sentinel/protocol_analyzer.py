"""Live packet capture and protocol classification module."""

from scapy.all import sniff, ARP, IP, TCP, UDP, ICMP, DNS, DNSQR, BOOTP, DHCP

ACTIVE_MONITORS = ["ARP", "DHCP", "DNS", "TCP/UDP", "ICMP", "TLS metadata"]


def _classify_packet(pkt):
    """Turn a single sniffed packet into a display-ready event dict, or None."""
    try:
        if pkt.haslayer(ARP):
            arp = pkt[ARP]
            if arp.op == 1:  # who-has
                return {
                    "protocol": "ARP",
                    "source": arp.psrc,
                    "destination": "Broadcast",
                    "info": f"Who-has {arp.pdst}? Tell {arp.psrc}",
                    "status": "Normal"
                }
            else:  # is-at (reply)
                return {
                    "protocol": "ARP",
                    "source": arp.psrc,
                    "destination": arp.pdst,
                    "info": f"{arp.psrc} is-at {arp.hwsrc}",
                    "status": "Normal"
                }

        if pkt.haslayer(DHCP):
            src = pkt[IP].src if pkt.haslayer(IP) else "0.0.0.0"
            dst = pkt[IP].dst if pkt.haslayer(IP) else "255.255.255.255"
            msg_type = None
            for opt in pkt[DHCP].options:
                if isinstance(opt, tuple) and opt[0] == "message-type":
                    msg_type = opt[1]
            label = {1: "Discover", 2: "Offer", 3: "Request", 5: "ACK"}.get(msg_type, "Message")
            return {
                "protocol": "DHCP",
                "source": src,
                "destination": dst,
                "info": f"DHCP {label} - Lease IP {src}",
                "status": "Secure"
            }

        if pkt.haslayer(DNSQR) and pkt.haslayer(IP):
            qname = pkt[DNSQR].qname.decode(errors="ignore").rstrip(".")
            return {
                "protocol": "DNS",
                "source": pkt[IP].src,
                "destination": pkt[IP].dst,
                "info": f"Standard Query A {qname}",
                "status": "Normal"
            }

        if pkt.haslayer(TCP) and pkt.haslayer(IP):
            tcp = pkt[TCP]
            if tcp.dport == 443 or tcp.sport == 443:
                return {
                    "protocol": "TLSv1.3",
                    "source": pkt[IP].src,
                    "destination": pkt[IP].dst,
                    "info": "Encrypted handshake / application data on port 443",
                    "status": "Encrypted"
                }
            return {
                "protocol": "TCP",
                "source": f"{pkt[IP].src}:{tcp.sport}",
                "destination": f"{pkt[IP].dst}:{tcp.dport}",
                "info": f"TCP flags={tcp.flags}",
                "status": "Normal"
            }

        if pkt.haslayer(UDP) and pkt.haslayer(IP):
            udp = pkt[UDP]
            return {
                "protocol": "UDP",
                "source": f"{pkt[IP].src}:{udp.sport}",
                "destination": f"{pkt[IP].dst}:{udp.dport}",
                "info": "UDP datagram",
                "status": "Normal"
            }

        if pkt.haslayer(ICMP) and pkt.haslayer(IP):
            return {
                "protocol": "ICMP",
                "source": pkt[IP].src,
                "destination": pkt[IP].dst,
                "info": "Echo request/reply",
                "status": "Normal"
            }
    except Exception:
        return None

    return None


def _flag_dns_bursts(events):
    """Mark DNS queries as 'Flagged' if a source made an unusually high
    number of DNS requests during this short capture window."""
    dns_counts = {}
    for e in events:
        if e["protocol"] == "DNS":
            dns_counts[e["source"]] = dns_counts.get(e["source"], 0) + 1

    for e in events:
        if e["protocol"] == "DNS" and dns_counts.get(e["source"], 0) >= 5:
            e["status"] = "Flagged"

    return events


def capture_protocol_stream(duration: int = 3, max_events: int = 25) -> dict:
    """Sniff live traffic for a short window and return a classified stream."""
    packets = sniff(timeout=duration, store=True)

    events = []
    for pkt in packets:
        classified = _classify_packet(pkt)
        if classified:
            events.append(classified)

    events = _flag_dns_bursts(events)

    events = events[-max_events:]
    for i, e in enumerate(events):
        e["id"] = i + 1

    return {
        "active_monitors": ACTIVE_MONITORS,
        "stream": events
    }