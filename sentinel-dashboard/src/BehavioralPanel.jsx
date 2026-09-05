import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export default function BehavioralPanel() {
  const [data, setData] = useState({
    anomaly_score: 0,
    alerts: []
  });
  const [loading, setLoading] = useState(true);

  const fetchBehavior = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/behavior-alerts');
      const json = await res.json();
      if (json && json.alerts) setData(json);
    } catch (err) {
      console.error("Using local behavioral alerts fallback", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBehavior(); }, []);

  const scoreColor = data.anomaly_score > 70 ? '#f85149'
    : data.anomaly_score > 30 ? '#d29922' : '#3fb950';

  const scoreLabel = data.anomaly_score > 70 ? 'CRITICAL'
    : data.anomaly_score > 30 ? 'ELEVATED' : 'NORMAL';

  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '10px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#f0f6fc' }}>
          <Activity size={18} color="#58a6ff" /> Behavioral Detection & Risk Correlation
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: `rgba(${scoreColor === '#f85149' ? '248,81,73' : scoreColor === '#d29922' ? '210,153,34' : '63,185,80'},0.15)`,
            color: scoreColor,
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            border: `1px solid ${scoreColor}40`
          }}>
            {scoreLabel} — Anomaly Score: {data.anomaly_score}/100
          </span>
          <button onClick={fetchBehavior} disabled={loading} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: '#58a6ff', padding: '4px'
          }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Anomaly Score Bar */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ height: '4px', background: '#21262d', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${data.anomaly_score}%`,
            background: `linear-gradient(90deg, #3fb950, ${scoreColor})`,
            borderRadius: '2px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#8b949e', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
          <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading alerts...
        </div>
      ) : data.alerts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.alerts.map((alert) => {
            const isHigh = alert.risk_level === 'HIGH' || alert.severity === 'high';
            const color = isHigh ? '#f85149' : '#d29922';
            const bgColor = isHigh ? 'rgba(248,81,73,0.08)' : 'rgba(210,153,34,0.08)';

            return (
              <div key={alert.id} style={{
                background: bgColor,
                border: `1px solid ${color}40`,
                padding: '14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                {isHigh
                  ? <ShieldAlert color={color} size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  : <AlertTriangle color={color} size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                }
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <strong style={{ color: '#f0f6fc', fontSize: '13px' }}>
                      {alert.type || 'Unknown Event'}
                    </strong>
                    <span style={{
                      background: `${color}25`,
                      color: color,
                      padding: '1px 7px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px'
                    }}>
                      {(alert.risk_level || alert.severity || 'LOW').toUpperCase()} RISK
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', color: '#8b949e', fontSize: '12px', lineHeight: '1.5' }}>
                    {alert.description || alert.message || 'No description available.'}
                  </p>
                  <small style={{ color: '#58a6ff', fontSize: '11px', fontFamily: 'monospace' }}>
                    ⚡ {alert.defensive_action || 'No action taken'}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px', color: '#3fb950' }}>
          <CheckCircle2 size={32} style={{ marginBottom: '8px', opacity: 0.8 }} />
          <p style={{ margin: 0, fontSize: '13px', color: '#8b949e' }}>
            Behavioral baseline is stable. No structural anomalies observed.
          </p>
        </div>
      )}
    </div>
  );
}