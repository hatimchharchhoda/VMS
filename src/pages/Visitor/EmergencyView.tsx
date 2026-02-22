import React from 'react';
import { useApp } from '../../context/AppContext';

const EXITS = [
  { zone: 'Main Lobby', direction: 'Ground Floor — Main Entrance (North)', distance: 'Primary Exit' },
  { zone: 'Emergency Stairwell A', direction: 'Floor 1-5 (East Wing)', distance: 'Secondary Exit' },
  { zone: 'Loading Dock Area', direction: 'Ground Floor (South Side)', distance: 'Emergency Exit' },
  { zone: 'Parking Level Exit', direction: 'Basement → Street Level', distance: 'Alternate Exit' },
];

const EmergencyView: React.FC = () => {
  const { emergencyMode } = useApp();

  return (
    <div className="section-gap">
      {!emergencyMode ? (
        <>
          <div className="page-header">
            <div className="page-header-left"><h1>Emergency Information</h1><p>Evacuation plans and safety procedures</p></div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🛡️</div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>No Active Emergency</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>Emergency instructions and evacuation routes will be displayed here if an emergency is activated by the admin team.</p>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">📋 Emergency Preparedness</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {[
                { icon: '🚪', title: 'Know Your Exits', desc: 'Always identify two exit routes when entering any floor' },
                { icon: '🧯', title: 'Fire Extinguisher Location', desc: 'Located at every stairwell and main corridor junction' },
                { icon: '📍', title: 'Assembly Point', desc: 'Meet at the main parking area (Zone P1) after evacuation' },
                { icon: '📞', title: 'Emergency Contact', desc: 'Security Control Room: Ext. 911 or +1-555-SECURITY' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Full emergency state */}
          <div className="visitor-emergency-hero" style={{ padding: '28px', cursor: 'default', marginBottom: 0 }}>
            <div style={{ fontSize: 48 }}>🚨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 26, marginBottom: 6 }}>EMERGENCY MODE ACTIVE</div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Follow all instructions from security personnel. Evacuate immediately if instructed.</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            <div className="card" style={{ border: '2px solid rgba(244,63,94,0.35)' }}>
              <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>⚡ Immediate Actions</div>
              {['Stay calm — do NOT run', 'Alert nearby security personnel', 'Follow emergency staff instructions', 'Do NOT use elevators', 'Proceed to your nearest exit', 'Meet at Parking Zone P1 (Assembly Point)'].map((action, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-primary)' }}>
                  <span style={{ fontSize: 16 }}>{['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'][i]}</span>{action}
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>🚪 Nearest Exits</div>
              {EXITS.map((exit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 20 }}>🚪</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{exit.zone}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exit.direction}</div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', background: 'rgba(244,63,94,0.12)', color: 'var(--accent-rose)', borderRadius: 4 }}>{exit.distance}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>📞 Emergency Contacts</div>
              {[
                { name: 'Security Control Room', num: 'Ext. 911', icon: '🚨' },
                { name: 'Medical Emergency', num: '+1-555-0911', icon: '🏥' },
                { name: 'Fire Department', num: '911', icon: '🚒' },
                { name: 'Facility Manager', num: '+1-555-0120', icon: '🏢' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--accent-rose)', fontWeight: 700 }}>{c.num}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmergencyView;
