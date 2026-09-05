import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

export default function ProtocolAnalyzer() {
  const [protoData, setProtoData] = useState({
    active_monitors: ["ARP", "DHCP", "DNS", "TCP/UDP", "ICMP", "TLS metadata"],
    stream: [
      { id: 1, protocol: "ARP", source: "192.168.1.10", destination: "Broadcast", info: "Who-has 192.168.1.1? Tell 192.168.1.10", status: "Normal" },
      { id: 2, protocol: "DHCP", source: "192.168.1.15", destination: "255.255.255.255", info: "DHCP Request - Lease IP 192.168.1.15", status: "Secure" },
      { id: 3, protocol: "DNS", source: "192.168.1.15", destination: "8.8.8.8", info: "Standard Query A api.telemetry-stream.net", status: "Flagged" },
      { id: 4, protocol: "TLSv1.3", source: "192.168.1.10", destination: "142.250.183.46", info: "Client Hello, SNI: gateway.internal", status: "Encrypted" }
    ]
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/protocols')
      .then(res => res.json())
      .then(json => {
        if (json && json.stream) setProtoData(json);
      })
      .catch(err => console.error("Using local protocol stream fallback", err));
  }, []);

  return (
    <div className="panel" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          <Terminal size={18} color="#58a6ff" /> Deep Protocol Analysis (DNS, DHCP, ARP, TLS)
        </h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {protoData.active_monitors.map((m, idx) => (
            <span key={idx} style={{ background: '#21262d', color: '#58a6ff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}>
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e' }}>
              <th style={{ padding: '8px' }}>Protocol</th>
              <th style={{ padding: '8px' }}>Source</th>
              <th style={{ padding: '8px' }}>Destination</th>
              <th style={{ padding: '8px' }}>Packet / Metadata Info</th>
              <th style={{ padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {protoData.stream.map((pkt) => (
              <tr key={pkt.id} style={{ borderBottom: '1px solid #21262d' }}>
                <td style={{ padding: '10px', color: '#58a6ff', fontWeight: 'bold', fontFamily: 'monospace' }}>{pkt.protocol}</td>
                <td style={{ padding: '10px', color: '#c9d1d9', fontFamily: 'monospace' }}>{pkt.source}</td>
                <td style={{ padding: '10px', color: '#c9d1d9', fontFamily: 'monospace' }}>{pkt.destination}</td>
                <td style={{ padding: '10px', color: '#8b949e', fontFamily: 'monospace', fontSize: '12px' }}>{pkt.info}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    background: pkt.status === 'Flagged' ? 'rgba(248, 81, 73, 0.2)' : 'rgba(56, 139, 253, 0.1)', 
                    color: pkt.status === 'Flagged' ? '#ff7b72' : '#58a6ff', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {pkt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}