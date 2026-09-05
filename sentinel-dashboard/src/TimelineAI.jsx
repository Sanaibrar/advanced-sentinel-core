import React, { useState, useEffect } from 'react';
import { Clock, Cpu } from 'lucide-react';

export default function TimelineAI() {
  const [data, setData] = useState({
    timeline: [
      { time: "22:10:31", event: "New device detected (MAC: 77:88:99...)" },
      { time: "22:10:42", event: "ARP anomaly observed on Gateway subnet" },
      { time: "22:11:03", event: "Unusual DNS burst triggered by 192.168.1.15" },
      { time: "22:11:16", event: "Risk correlation engine flagged HIGH RISK incident" }
    ],
    ai_explanation: {
      summary: "192.168.1.15 ne pehli baar network join kiya aur shortly afterward unusual DNS activity observe hui. Investigation recommended.",
      confidence: "94.5%",
      recommendation: "Isolate the node temporarily and inspect active port streams."
    }
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/timeline-ai')
      .then(res => res.json())
      .then(json => {
        if (json && json.timeline) setData(json);
      })
      .catch(err => console.error("Using local timeline fallback", err));
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
      
      {/* Attack Timeline Panel */}
      <div className="panel" style={{ margin: 0 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '16px' }}>
          <Clock size={18} color="#58a6ff" /> Attack Timeline Intelligence
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.timeline?.map((item, index) => (
            <div key={index} style={{ 
              background: '#0d1117', 
              border: '1px solid #30363d', 
              padding: '10px 14px', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ color: '#58a6ff', fontFamily: 'monospace', fontSize: '12px', background: 'rgba(88, 166, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                {item.time}
              </span>
              <span style={{ color: '#c9d1d9', fontSize: '13px' }}>{item.event}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable AI Layer Panel */}
      <div className="panel" style={{ margin: 0 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '16px' }}>
          <Cpu size={18} color="#a371f7" /> Explainable AI Layer (Sentinel AI)
        </h2>
        <div style={{ background: '#0d1117', border: '1px solid #30363d', padding: '16px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: '#f0f6fc', fontSize: '14px' }}>Incident Diagnosis</strong>
            <span style={{ background: 'rgba(63, 185, 80, 0.2)', color: '#3fb950', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
              Confidence: {data?.ai_explanation?.confidence ?? 'N/A'}
            </span>
          </div>
          <p style={{ color: '#8b949e', fontSize: '13px', lineHeight: '1.5', margin: 0, fontStyle: 'italic' }}>
            "{data?.ai_explanation?.summary ?? 'No summary available'}"
          </p>
          <div style={{ borderTop: '1px solid #21262d', paddingTop: '10px', marginTop: '4px' }}>
            <span style={{ color: '#58a6ff', fontSize: '12px', fontWeight: 'bold' }}>Recommended Defense:</span>
            <p style={{ color: '#c9d1d9', fontSize: '12px', margin: '4px 0 0 0' }}>{data?.ai_explanation?.recommendation ?? 'No recommendation available'}</p>
          </div>
        </div>
      </div>

    </div>
  );
}