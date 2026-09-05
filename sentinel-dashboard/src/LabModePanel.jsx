import React, { useState, useEffect } from 'react';
import { FlaskConical, Cpu, Radio, AlertOctagon } from 'lucide-react';

export default function LabModePanel() {
  const [labData, setLabData] = useState({
    lab_mode_active: true,
    environment: "Isolated Sandbox / Honeypot",
    active_honeypots: [
      { port: 22, service: "SSH-Honeypot", traps_triggered: 4 },
      { port: 80, service: "HTTP-Trap", traps_triggered: 12 },
      { port: 443, service: "TLS-Decoy", traps_triggered: 1 }
    ],
    telemetry: "Controlled scanning telemetry is recording simulated attacker probes."
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/lab-mode')
      .then(res => res.json())
      .then(json => {
        if (json?.active_honeypots) setLabData(json);
      })
      .catch(err => console.error("Using local lab mode fallback", err));
  }, []);

  const totalTraps = labData.active_honeypots?.reduce((sum, h) => sum + h.traps_triggered, 0) || 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(248,81,73,0.04) 0%, #161b22 60%)',
      border: '1px solid rgba(248,81,73,0.4)',
      borderRadius: '10px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#f85149' }}>
          <FlaskConical size={18} color="#f85149" /> Lab Mode & Honeypot Telemetry
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: 'rgba(248,81,73,0.15)',
            color: '#f85149',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: '1px solid rgba(248,81,73,0.3)'
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%', background: '#f85149',
              animation: 'pulse 1.5s infinite', display: 'inline-block'
            }} />
            <Cpu size={12} /> SANDBOX ACTIVE
          </span>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#6e7681', marginBottom: '18px', fontFamily: 'monospace', lineHeight: '1.5' }}>
        {labData.telemetry}
      </p>

      {/* Total traps counter */}
      <div style={{
        background: 'rgba(248,81,73,0.06)',
        border: '1px solid rgba(248,81,73,0.15)',
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <AlertOctagon size={14} color="#f85149" />
        <span style={{ color: '#8b949e', fontSize: '12px' }}>
          Total traps triggered this session:
        </span>
        <strong style={{ color: '#f85149', fontSize: '14px', marginLeft: 'auto' }}>{totalTraps}</strong>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {labData.active_honeypots?.map((trap, idx) => (
          <div key={idx} style={{
            background: '#0d1117',
            border: '1px solid #30363d',
            padding: '14px 12px',
            borderRadius: '8px',
            textAlign: 'center',
            transition: 'border-color 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
              <Radio size={11} color="#58a6ff" />
              <span style={{ color: '#58a6ff', fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                PORT {trap.port}
              </span>
            </div>
            <div style={{ color: '#f0f6fc', fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>
              {trap.service}
            </div>
            <span style={{
              color: trap.traps_triggered > 5 ? '#f85149' : '#d29922',
              fontSize: '11px',
              background: trap.traps_triggered > 5 ? 'rgba(248,81,73,0.12)' : 'rgba(210,153,34,0.12)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              {trap.traps_triggered} Traps
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}