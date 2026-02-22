import React, { useState } from 'react';
import { useVisitor } from '../../context/VisitorContext';
import { useApp } from '../../context/AppContext';
import { QrCode, X, Calendar, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TabKey = 'upcoming' | 'pending' | 'approved' | 'all';

const MyVisits: React.FC = () => {
  const { myVisits, pendingVisits, upcomingVisits, cancelVisit, rescheduleVisit } = useVisitor();
  const { accessTemplates } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('upcoming');
  const [rescheduleModal, setRescheduleModal] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');

  const getList = () => {
    if (tab === 'upcoming') return upcomingVisits;
    if (tab === 'pending') return pendingVisits;
    if (tab === 'approved') return myVisits.filter(v => v.status === 'approved' || v.status === 'checked-in');
    return [...myVisits].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  };

  const list = getList();

  const statusColor = { pending: '#f59e0b', approved: '#10b981', rejected: '#f43f5e', 'checked-in': '#3b82f6', 'checked-out': '#64748b' };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left"><h1>My Visits</h1><p>Track and manage all your visit requests</p></div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/visitor/register')}>+ Register Visit</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['upcoming', 'pending', 'approved', 'all'] as TabKey[]).map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'pending' && pendingVisits.length > 0 && <span className="sidebar-link-badge" style={{ marginLeft: 6 }}>{pendingVisits.length}</span>}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No visits here</h3><p>Try another tab or register a new visit</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {list.map(v => {
            const tpl = accessTemplates.find(t => t.id === v.accessTemplateId);
            const color = (statusColor as Record<string, string>)[v.status] ?? '#64748b';
            return (
              <div key={v.id} className="card" style={{ borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 36, lineHeight: 1 }}>{tpl?.icon ?? '📋'}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{v.purpose}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />{v.visitDate} &nbsp;
                        <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />{v.visitTime}–{v.endTime}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <span className="chip">👤 {v.hostName}</span>
                        {tpl && <span className="chip" style={{ background: tpl.color + '22', color: tpl.color }}>{tpl.icon} {tpl.name}</span>}
                        {v.barcodeId && <span className="chip" style={{ fontFamily: 'monospace', fontSize: 10 }}><QrCode size={10} /> {v.barcodeId}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span className={`badge badge-${v.status}`}>{v.status}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {v.status === 'approved' && <button className="btn btn-success btn-sm" onClick={() => navigate('/visitor/badge')}><QrCode size={12} /> Badge</button>}
                      {v.status === 'pending' && (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setRescheduleModal(v.id); setNewDate(v.visitDate); setNewTime(v.visitTime); setNewEndTime(v.endTime); }}><RefreshCw size={12} /> Reschedule</button>
                          <button className="btn btn-danger btn-sm" onClick={() => cancelVisit(v.id)}><X size={12} /> Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {v.notes && <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>💬 "{v.notes}"</div>}
                {v.status === 'rejected' && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--accent-rose)' }}>❌ This visit was rejected or cancelled.</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🔄 Reschedule Visit</div>
              <button className="modal-close" onClick={() => setRescheduleModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">New Date</label>
                  <input className="form-input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-input" type="time" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setRescheduleModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { if (rescheduleModal && newDate) { rescheduleVisit(rescheduleModal, newDate, newTime, newEndTime); setRescheduleModal(null); } }}>Confirm Reschedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVisits;
