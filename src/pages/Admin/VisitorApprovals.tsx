import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { generateBarcodeId } from '../../utils/accessEngine';
import { Check, X, Edit3, RefreshCw, Search, Filter } from 'lucide-react';
import type { Visitor } from '../../types';

const VisitorApprovals: React.FC = () => {
  const { visitors, setVisitors, accessTemplates, users, addNotification } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'view' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [alternateHost, setAlternateHost] = useState('');
  const [newDate, setNewDate] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const hosts = users.filter(u => u.role === 'host');

  const filtered = useMemo(() => {
    return visitors.filter(v => {
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchSearch = !search || v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase()) || v.company.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [visitors, statusFilter, search]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const openApprove = (v: Visitor) => {
    setSelectedVisitor(v);
    setSelectedTemplate(v.accessTemplateId || '');
    setAlternateHost(v.hostId);
    setNewDate(v.visitDate);
    setModalMode('approve');
  };

  const handleApprove = () => {
    if (!selectedVisitor) return;
    const barcode = generateBarcodeId(selectedVisitor.id);
    setVisitors(visitors.map(v => v.id === selectedVisitor.id ? {
      ...v,
      status: 'approved',
      accessTemplateId: selectedTemplate || null,
      hostId: alternateHost || v.hostId,
      visitDate: newDate || v.visitDate,
      barcodeId: barcode,
      approvedAt: new Date().toISOString(),
      approvedBy: user?.id || null,
    } : v));
    addNotification({ type: 'success', title: 'Visitor Approved', message: `${selectedVisitor.visitorName} has been approved with barcode ${barcode}` });
    setModalMode(null);
    setSelectedVisitor(null);
  };

  const handleReject = (v: Visitor) => {
    setVisitors(visitors.map(vis => vis.id === v.id ? { ...vis, status: 'rejected' } : vis));
    addNotification({ type: 'warning', title: 'Visitor Rejected', message: `${v.visitorName}'s visit request has been rejected.` });
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Visitor Approvals</h1>
          <p>Review, approve, or reject visitor access requests</p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-pending">{visitors.filter(v => v.status === 'pending').length} Pending</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-bar" style={{ width: 280 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search visitor, company..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} color="var(--text-muted)" />
          <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
          </select>
        </div>
        <div className="toolbar-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} results
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Company</th>
                <th>Purpose</th>
                <th>Host</th>
                <th>Visit Date & Time</th>
                <th>Template</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">🔍</div><h3>No visitors found</h3></div></td></tr>
              ) : paged.map(v => {
                const tpl = accessTemplates.find(t => t.id === v.accessTemplateId);
                return (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {v.visitorName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{v.visitorName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{v.company}</td>
                    <td style={{ fontSize: 12 }}>{v.purpose}</td>
                    <td style={{ fontSize: 12 }}>{v.hostName}</td>
                    <td>
                      <div style={{ fontSize: 12 }}>{v.visitDate}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.visitTime} – {v.endTime}</div>
                    </td>
                    <td>
                      {tpl ? (
                        <span className="chip" style={{ background: tpl.color + '22', color: tpl.color }}>
                          {tpl.icon} {tpl.name}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
                    </td>
                    <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {v.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => openApprove(v)}>
                              <Check size={12} /> Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(v)}>
                              <X size={12} />
                            </button>
                          </>
                        )}
                        {v.status === 'approved' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => openApprove(v)}>
                            <Edit3 size={12} /> Edit
                          </button>
                        )}
                        {(v.status === 'checked-in' || v.status === 'checked-out') && (
                          <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedVisitor(v); setModalMode('view'); }}>
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p-1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Approve / Edit Modal */}
      {modalMode === 'approve' && selectedVisitor && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {selectedVisitor.status === 'pending' ? `Approve Visitor: ${selectedVisitor.visitorName}` : `Edit Visit: ${selectedVisitor.visitorName}`}
              </span>
              <button className="modal-close" onClick={() => setModalMode(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Visitor</label>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedVisitor.visitorName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedVisitor.email} · {selectedVisitor.company}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedVisitor.purpose}</div>
                </div>
              </div>
              <div className="sep"></div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Access Template *</label>
                  <select className="form-select" value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                    <option value="">-- Select Template --</option>
                    {accessTemplates.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Host</label>
                  <select className="form-select" value={alternateHost} onChange={e => setAlternateHost(e.target.value)}>
                    {hosts.map(h => <option key={h.id} value={h.id}>{h.name} ({h.department})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Visit Date</label>
                  <input className="form-input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                </div>
              </div>
              {selectedTemplate && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  {(() => {
                    const tpl = accessTemplates.find(t => t.id === selectedTemplate);
                    return tpl ? (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: tpl.color, marginBottom: 6 }}>{tpl.icon} {tpl.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tpl.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                          ⏰ {tpl.timeRestrictions.startTime}–{tpl.timeRestrictions.endTime} · Max {tpl.maxDuration}min
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalMode(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApprove}>
                <Check size={14} /> {selectedVisitor.status === 'pending' ? 'Approve & Generate Pass' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modalMode === 'view' && selectedVisitor && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Visitor Details</span>
              <button className="modal-close" onClick={() => setModalMode(null)}>✕</button>
            </div>
            <div className="modal-body">
              {[
                ['Name', selectedVisitor.visitorName],
                ['Email', selectedVisitor.email],
                ['Company', selectedVisitor.company],
                ['Purpose', selectedVisitor.purpose],
                ['Host', selectedVisitor.hostName],
                ['Visit Date', selectedVisitor.visitDate],
                ['Status', selectedVisitor.status],
                ['Barcode', selectedVisitor.barcodeId || '—'],
                ['Check-in', selectedVisitor.checkInTime ? new Date(selectedVisitor.checkInTime).toLocaleString() : '—'],
                ['Check-out', selectedVisitor.checkOutTime ? new Date(selectedVisitor.checkOutTime).toLocaleString() : '—'],
              ].map(([label, value]) => (
                <div key={label} className="info-row">
                  <div className="info-label">{label}</div>
                  <div className="info-value"><span className={label === 'Status' ? `badge badge-${value}` : ''}>{value}</span></div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalMode(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorApprovals;
