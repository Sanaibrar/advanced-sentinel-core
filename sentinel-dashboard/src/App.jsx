import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Server, Radio, AlertTriangle, RefreshCw } from 'lucide-react';
import InventoryPage from './InventoryPage';
import BehavioralPanel from './BehavioralPanel';
import TimelineAI from './TimelineAI';
import EvidenceLogger from './EvidenceLogger';
import ProtocolAnalyzer from './ProtocolAnalyzer';
import LabModePanel from './LabModePanel';
import AttackSimulator from './AttackSimulator';
import TopologyMap from './TopologyMap';
import './App.css';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSecurityData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/status');
      if (!response.ok) throw new Error('Failed to connect to Sentinel Backend');
      const json = await response.json();
      setData(json);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading-screen"><RefreshCw className="spin" /> Loading Sentinel Core Pro...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-area">
          <ShieldAlert className="shield-icon" />
          <h1>ADVANCED SENTINEL CORE <span className="badge">PRO V2</span></h1>
        </div>
        <button className="refresh-btn" onClick={fetchSecurityData}>
          <RefreshCw size={16} /> Refresh Status
        </button>
      </header>

      {error && <div className="error-banner"><AlertTriangle /> Backend Connection Error: {error}. Make sure `app.py` is running!</div>}

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <h3>Network Health Score</h3>
            <p className="metric-value">{data?.network_health_score ?? 75}%</p>
          </div>
          <Activity className="card-icon green" />
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Gateway Node</h3>
            <p className="metric-value sub">{data?.gateway || "192.168.1.1"}</p>
          </div>
          <Server className="card-icon blue" />
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Connected Nodes</h3>
            <p className="metric-value">{data?.total_connected_nodes ?? 3}</p>
          </div>
          <Radio className="card-icon purple" />
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Detected Events</h3>
            <p className="metric-value">{data?.detected_events_count ?? 3}</p>
          </div>
          <ShieldAlert className="card-icon orange" />
        </div>
      </div>

      <div className="content-grid">
        {/* Behavioral Detection Panel */}
        <BehavioralPanel />

        {/* Network Inventory Component */}
        <InventoryPage />

        {/* Deep Protocol Analysis Component */}
        <ProtocolAnalyzer />

        {/* Device Relationship & Topology Map Component */}
        <TopologyMap />

        {/* Lab Mode & Honeypot Telemetry Component */}
        <LabModePanel />

        {/* Live Attack Simulator Component */}
        <AttackSimulator />

        {/* Attack Timeline & Explainable AI Layer */}
        <TimelineAI />

        {/* Tamper-Evident Evidence Hash-Chain Logger */}
        <EvidenceLogger />
      </div>
    </div>
  );
}