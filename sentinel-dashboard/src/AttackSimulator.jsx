import React, { useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AttackSimulator() {
  const [simulating, setSimulating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [feedbackType, setFeedbackType] = useState('success');

  const triggerAttack = async () => {
    setSimulating(true);
    setFeedback(null);
    setErrorMsg(null);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/simulate-attack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);

      const data = await res.json();
      const msg = data.message || "Attack simulated successfully!";
      const isHighRisk = msg.includes("high-risk");
      setFeedbackType(isHighRisk ? 'warning' : 'success');
      setFeedback(msg);

    } catch (err) {
      setErrorMsg("Connection refused. Is Python app.py running on port 5000?");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{
      marginTop: '20px',
      background: 'linear-gradient(135deg, rgba(210,153,34,0.05) 0%, rgba(13,17,23,1) 60%)',
      border: '1px solid #d29922',
      borderRadius: '10px',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#d29922' }}>
            <Zap size={18} color="#d29922" fill="rgba(210,153,34,0.3)" /> Red Team Live Attack Simulator
          </h2>
          <p style={{ fontSize: '12px', color: '#6e7681', margin: '5px 0 0 0', fontFamily: 'monospace' }}>
            Trigger a controlled brute-force probe to test behavioral detection and audit logging live.
          </p>
        </div>

        <button
          onClick={triggerAttack}
          disabled={simulating}
          style={{
            background: simulating
              ? 'rgba(210,153,34,0.15)'
              : 'linear-gradient(135deg, #d29922, #e3b341)',
            color: simulating ? '#d29922' : '#0d1117',
            border: simulating ? '1px solid #d29922' : 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: simulating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: simulating ? 'none' : '0 0 15px rgba(210,153,34,0.3)'
          }}
        >
          {simulating
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Scanning Network...</>
            : <><Zap size={14} /> Simulate Attack</>
          }
        </button>
      </div>

      {feedback && (
        <div style={{
          marginTop: '14px',
          padding: '10px 14px',
          background: feedbackType === 'warning'
            ? 'rgba(210,153,34,0.1)'
            : 'rgba(46,160,67,0.1)',
          color: feedbackType === 'warning' ? '#e3b341' : '#3fb950',
          border: `1px solid ${feedbackType === 'warning' ? 'rgba(210,153,34,0.3)' : 'rgba(46,160,67,0.3)'}`,
          borderRadius: '6px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'monospace'
        }}>
          <CheckCircle2 size={14} /> {feedback}
        </div>
      )}

      {errorMsg && (
        <div style={{
          marginTop: '14px',
          padding: '10px 14px',
          background: 'rgba(248,81,73,0.1)',
          color: '#f85149',
          border: '1px solid rgba(248,81,73,0.3)',
          borderRadius: '6px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'monospace'
        }}>
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}
    </div>
  );
}