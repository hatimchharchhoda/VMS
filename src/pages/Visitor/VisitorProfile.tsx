import React, { useState } from 'react';
import { useVisitor } from '../../context/VisitorContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, Check, Lock } from 'lucide-react';

const VisitorProfile: React.FC = () => {
  const { visitorProfile, updateProfile, myVisits } = useVisitor();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: visitorProfile?.phone || '', company: visitorProfile?.department || visitorProfile?.company || '' });
  const [pwForm, setPwForm] = useState({ old: '', newPw: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [pwResult, setPwResult] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    updateProfile({ phone: form.phone, company: form.company, department: form.company });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePwChange = () => {
    if (pwForm.newPw !== pwForm.confirm) { setPwResult('❌ New passwords do not match'); return; }
    if (pwForm.newPw.length < 6) { setPwResult('❌ Password must be at least 6 characters'); return; }
    setPwResult('✅ Password updated (simulated — localStorage only)');
    setPwForm({ old: '', newPw: '', confirm: '' });
    setTimeout(() => setPwResult(''), 4000);
  };

  const handleDelete = () => {
    localStorage.clear();
    logout();
    navigate('/');
  };

  const rep = visitorProfile?.reputationScore ?? 0;
  const risk = visitorProfile?.riskScore ?? 0;
  const repColor = rep >= 80 ? '#10b981' : rep >= 50 ? '#f59e0b' : '#f43f5e';
  const riskColor = risk <= 20 ? '#10b981' : risk <= 50 ? '#f59e0b' : '#f43f5e';

  const completed = myVisits.filter(v => v.status === 'checked-out').length;
  const rejected = myVisits.filter(v => v.status === 'rejected').length;
  const violations = myVisits.reduce((s, v) => s + (v.violations ?? 0), 0);

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left"><h1>My Profile</h1><p>Manage your visitor profile and security settings</p></div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Profile Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white' }}>
                {visitorProfile?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{visitorProfile?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{visitorProfile?.email}</div>
                <span className="badge badge-active" style={{ marginTop: 6 }}>● Visitor</span>
              </div>
            </div>

            {saved && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><Check size={14} /> Profile saved!</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={visitorProfile?.name || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" value={visitorProfile?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1-555-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Company / Organization</label>
                <input className="form-input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Your company" />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleSave}><Save size={14} /> Save Changes</button>
            </div>
          </div>

          {/* Password Change */}
          <div className="card">
            <div className="card-header"><div className="card-title"><Lock size={14} /> Change Password</div></div>
            {pwResult && <div style={{ fontSize: 13, padding: '8px 12px', background: pwResult.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', borderRadius: 8, marginBottom: 14, color: pwResult.startsWith('✅') ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{pwResult}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={pwForm.old} onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))} placeholder="Current password" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} placeholder="New password (min 6 chars)" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Confirm new password" />
              </div>
              <button className="btn btn-ghost btn-full" onClick={handlePwChange}><Lock size={13} /> Update Password</button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ borderColor: 'rgba(244,63,94,0.25)' }}>
            <div className="card-header"><div className="card-title" style={{ color: 'var(--accent-rose)' }}>⚠️ Danger Zone</div></div>
            {!showDelete ? (
              <button className="btn btn-danger btn-full" onClick={() => setShowDelete(true)}><Trash2 size={14} /> Delete My Account</button>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>This will clear all your local data and sign you out. This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDelete(false)}>Cancel</button>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Yes, Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scores & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Reputation */}
          <div className="card">
            <div className="card-header"><div className="card-title">🏆 Visitor Reputation</div></div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reputation Score</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: repColor }}>{rep}/100</span>
              </div>
              <div className="reputation-bar-bg">
                <div className="reputation-bar-fill" style={{ width: `${rep}%`, background: repColor }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                {rep >= 80 ? '🌟 Excellent — Trusted visitor' : rep >= 50 ? '👍 Good — No major issues' : '⚠️ Needs Improvement'}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Access Risk Score</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: riskColor }}>{risk}/100</span>
              </div>
              <div className="reputation-bar-bg">
                <div className="reputation-bar-fill" style={{ width: `${risk}%`, background: riskColor }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                {risk <= 20 ? '🟢 Low Risk' : risk <= 50 ? '🟡 Medium Risk' : '🔴 High Risk — Review required'}
              </div>
            </div>
          </div>

          {/* Visit Stats */}
          <div className="card">
            <div className="card-header"><div className="card-title">📊 Visit Statistics</div></div>
            {[
              { label: 'Total Visits', value: myVisits.length },
              { label: 'Completed', value: completed },
              { label: 'Pending / Upcoming', value: myVisits.filter(v => v.status === 'pending' || v.status === 'approved').length },
              { label: 'Rejected / Cancelled', value: rejected },
              { label: 'Total Violations', value: violations },
            ].map((s, i) => (
              <div key={i} className="info-row">
                <span className="info-label">{s.label}</span>
                <span className="info-value" style={{ fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorProfile;
