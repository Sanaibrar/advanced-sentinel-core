import React, { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';

export default function TopologyMap() {
  const [topology, setTopology] = useState({
    gateway: "192.168.1.1",
    connected_nodes: []
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/topology')
      .then(res => res.json())
      .then(json => {
        if (json && json.gateway) setTopology(json);
      })
      .catch(err => console.error("Using local topology fallback", err));
  }, []);

  return (
    <div className="panel" style={{ margin: 0, marginTop: '20px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '16px' }}>
        <Share2 size={18} color="#3fb950" /> Device Relationship & Topology Map
      </h2>

      <div style={{ background: '#0d1117', border: '1px solid #30363d', padding: '16px', borderRadius: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ background: 'rgba(63, 185, 80, 0.15)', color: '#3fb950', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
            GATEWAY
          </span>
          <span style={{ color: '#f0f6fc', fontFamily: 'monospace', fontSize: '14px' }}>{topology.gateway}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px', borderLeft: '2px dashed #30363d' }}>
          {topology.connected_nodes?.length > 0 ? (
            topology.connected_nodes.map((node, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#161b22',
                padding: '8px 12px',
                borderRadius: '4px'
              }}>
                <div>
                  <span style={{ color: '#58a6ff', fontFamily: 'monospace', fontSize: '13px' }}>{node.ip}</span>
                  <span style={{ color: '#6e7681', fontSize: '11px', marginLeft: '10px' }}>{node.mac}</span>
                </div>
                <span style={{ color: '#8b949e', fontSize: '11px', fontStyle: 'italic' }}>{node.relation}</span>
              </div>
            ))
          ) : (
            <p style={{ color: '#8b949e', fontSize: '13px' }}>No connected devices found. Run a scan first.</p>
          )}
        </div>
      </div>
    </div>
  );
}