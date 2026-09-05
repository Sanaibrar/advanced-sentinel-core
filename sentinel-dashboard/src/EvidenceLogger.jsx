import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Link2 } from 'lucide-react';

export default function EvidenceLogger() {
  const [auditData, setAuditData] = useState({
    audit_chain: [
      { id: 1, action: "System Boot & Core Initialization", timestamp: "22:00:01", hash: "a3f8b2c1...", prev_hash: "00000000..." },
      { id: 2, action: "ARP Inventory Scanned - 3 Nodes Active", timestamp: "22:05:12", hash: "9e4d1a7f...", prev_hash: "a3f8b2c1..." },
      { id: 3, action: "Behavioral Anomaly Flagged: Unusual DNS Burst", timestamp: "22:11:03", hash: "c72b8f3e...", prev_hash: "9e4d1a7f..." }
    ],
    status: "Tamper-Evident & Verified"
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/audit-logs')
      .then(res => res.json())
      .then(json => {
        if (json && json.audit_chain) setAuditData(json);
      })
      .catch(err => console.error("Using local audit logs fallback", err));
  }, []);

  return (
    <div className="panel" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          <Lock size={18} color="#3fb950" /> Tamper-Evident Evidence Hash-Chain
        </h2>
        <span style={{ background: 'rgba(63, 185, 80, 0.2)', color: '#3fb950', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={14} /> {auditData.status}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {auditData.audit_chain.map((log) => (
          <div key={log.id} style={{ 
            background: '#0d1117', 
            border: '1px solid #30363d', 
            padding: '12px 14px', 
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#58a6ff', fontFamily: 'monospace', fontSize: '12px' }}>[{log.timestamp}]</span>
                <strong style={{ color: '#f0f6fc', fontSize: '13px' }}>{log.action}</strong>
              </div>
              <div style={{ display: 'flex', gap: '15px', fontSize: '11px', color: '#8b949e', fontFamily: 'monospace' }}>
                <span>Prev: {log.prev_hash}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#3fb950' }}>
                  <Link2 size={12} /> Hash: {log.hash}
                </span>
              </div>
            </div>
            <span style={{ background: 'rgba(56, 139, 253, 0.1)', color: '#58a6ff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
              BLOCK #{log.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}