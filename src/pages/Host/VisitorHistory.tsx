import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Search } from 'lucide-react';

const VisitorHistory: React.FC = () => {
  const { visitors, scanLogs, accessTemplates } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const myVisitors = useMemo(() => visitors.filter(v => {
    const isMyVisitor = v.hostId === user?.id;
    const matchSearch = !search || v.visitorName.toLowerCase().includes(search.toLowerCase()) || v.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return isMyVisitor && matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [visitors, user, search, statusFilter]);

  const paged = myVisitors.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(myVisitors.length / PER_PAGE);
  
  const getVisitDuration = (v: typeof visitors[0]) => {
    if (v.checkInTime && v.checkOutTime) {
      const diff = new Date(v.checkOutTime).getTime() - new Date(v.checkInTime).getTime();
      const minutes = Math.floor(diff / 60000);
      return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }
    return '—';
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Visitor History</h1>
          <p>All past and present visitors assigned to you</p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-active">{myVisitors.length} total</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar" style={{ width: 260 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search name, company..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="toolbar-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{myVisitors.length} visitors</div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Visitor</th><th>Company</th><th>Purpose</th><th>Visit Date</th><th>Duration</th><th>Template</th><th>Status</th></tr>
            </thead>
            <tbody>
              {paged.map(v => {
                const tpl = accessTemplates.find(t => t.id === v.accessTemplateId);
                return (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{v.visitorName.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{v.visitorName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{v.company}</td>
                    <td style={{ fontSize: 12 }}>{v.purpose}</td>
                    <td>
                      <div style={{ fontSize: 12 }}>{v.visitDate}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.visitTime}–{v.endTime}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{getVisitDuration(v)}</td>
                    <td>
                      {tpl ? (
                        <span className="chip" style={{ background: tpl.color + '22', color: tpl.color }}>{tpl.icon} {tpl.name}</span>
                      ) : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state" style={{ padding: '40px' }}><div className="empty-state-icon">📋</div><h3>No visitors found</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">{(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, myVisitors.length)} of {myVisitors.length}</span>
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
    </div>
  );
};

export default VisitorHistory;
