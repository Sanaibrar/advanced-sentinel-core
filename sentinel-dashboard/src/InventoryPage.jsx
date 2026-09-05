import React, { useState, useEffect } from 'react';
import { Server, Laptop, Smartphone, Wifi, RefreshCw, Shield } from 'lucide-react';

function getDeviceInfo(ip, mac) {
  const lastOctet = parseInt(ip?.split('.').pop());
  const macUpper = (mac || '').toUpperCase();

  if (lastOctet === 1) return { type: 'Router', icon: <Wifi size={15} color="#58a6ff" />, status: 'Secure', statusColor: '#3fb950' };

  // Common phone MAC prefixes (Apple, Samsung, Xiaomi, etc.)
  const phonePrefixes = ['A4:C3:F0', 'F0:18:98', '74:40:BB', '00:BB:3A', 'D8:96:95', 'AC:BC:32'];
  const isPhone = phonePrefixes.some(p => macUpper.startsWith(p));
  if (isPhone) return { type: 'Phone', icon: <Smartphone size={15} color="#a371f7" />, status: 'Active', statusColor: '#58a6ff' };

  return { type: 'Laptop', icon: <Laptop size={15} color="#3fb950" />, status: 'Active', statusColor: '#58a6ff' };
}

export default function InventoryPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/inventory');
      const data = await res.json();
      if (data?.devices) setDevices(data.devices);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, []);

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
          <Server size={18} color="#58a6ff" />
          Network Inventory & Connected Nodes
          <span style={{
            background: '#21262d',
            color: '#8b949e',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 'normal'
          }}>{devices.length}</span>
        </h2>
        <button onClick={fetchInventory} disabled={loading} style={{
          background: loading ? 'transparent' : '#21262d',
          color: '#58a6ff',
          border: '1px solid #30363d',
          padding: '6px 14px',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '500'
        }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Scanning...' : 'Scan Nodes'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d' }}>
              {['Device Type', 'IP Address', 'MAC Address', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 12px', color: '#6e7681', fontWeight: '600', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i}>
                  {[1, 2, 3, 4].map(j => (
                    <td key={j} style={{ padding: '14px 12px' }}>
                      <div style={{ height: '12px', background: '#21262d', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : devices.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#8b949e', fontSize: '13px' }}>
                  <Shield size={24} style={{ marginBottom: '8px', opacity: 0.4 }} /><br />
                  No devices found. Run a scan first.
                </td>
              </tr>
            ) : devices.map((dev, i) => {
              const info = getDeviceInfo(dev.ip, dev.mac);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #21262d', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f0f6fc' }}>
                      {info.icon} {dev.type || info.type}
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#58a6ff', fontFamily: 'monospace', fontSize: '12px' }}>{dev.ip}</td>
                  <td style={{ padding: '12px', color: '#8b949e', fontFamily: 'monospace', fontSize: '11px' }}>{dev.mac}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: `${info.statusColor}20`,
                      color: info.statusColor,
                      padding: '3px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      border: `1px solid ${info.statusColor}40`
                    }}>
                      {dev.status || info.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}