import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Check, X } from 'lucide-react';
import { generateBarcodeId } from '../../utils/accessEngine';

const HostApprovals: React.FC = () => {
  const { visitors, setVisitors, accessTemplates, addNotification } = useApp();
  const { user } = useAuth();

  const pending = visitors.filter(v => v.hostId === user?.id && v.status === 'pending');

  const approve = (v: typeof visitors[0], templateId: string) => {
    const barcode = generateBarcodeId(v.id);
    setVisitors(visitors.map(vis => vis.id === v.id ? { ...vis, status: 'approved', barcodeId: barcode, accessTemplateId: templateId || null, approvedAt: new Date().toISOString(), approvedBy: user?.id || null } : vis));
    addNotification({ type: 'success', title: 'Visitor Approved', message: `${v.visitorName} approved — Pass: ${barcode}` });
  };

  const reject = (v: typeof visitors[0]) => {
    setVisitors(visitors.map(vis => vis.id === v.id ? { ...vis, status: 'rejected' } : vis));
    addNotification({ type: 'warning', title: 'Visitor Rejected', message: `${v.visitorName} has been rejected.` });
  };

  const [templateSelections, setTemplateSelections] = React.useState<Record<string, string>>({});

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Approve Visitors</h1>
          <p>Review and action visitor requests assigned to you</p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-pending">{pending.length} Pending</span>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px' }}>
          <div className="empty-state-icon">✅</div>
          <h3>All visitor requests handled!</h3>
          <p>No pending approvals at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pending.map(v => (
            <div key={v.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{v.visitorName.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{v.visitorName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.email} · {v.company}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📋 {v.purpose}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 {v.visitDate} · {v.visitTime}–{v.endTime}</div>
                  <select
                    className="form-select"
                    value={templateSelections[v.id] || ''}
                    onChange={e => setTemplateSelections(prev => ({ ...prev, [v.id]: e.target.value }))}
                  >
                    <option value="">-- Suggest template (optional) --</option>
                    {accessTemplates.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success" style={{ flex: 1 }} onClick={() => approve(v, templateSelections[v.id] || '')}>
                      <Check size={14} /> Approve
                    </button>
                    <button className="btn btn-danger" onClick={() => reject(v)}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {v.notes && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  💬 "{v.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostApprovals;
