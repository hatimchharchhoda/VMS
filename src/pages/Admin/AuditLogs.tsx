import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Filter, Download } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const { scanLogs, visitors, users } = useApp();
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const allLogs = useMemo(() => {
    // Combine scan logs with approval events
    const approvalEvents = visitors
      .filter(v => v.approvedAt)
      .map(v => ({
        id: `approval-${v.id}`,
        type: 'approval' as const,
        action: v.status === 'rejected' ? 'Visitor Rejected' : 'Visitor Approved',
        actor: users.find(u => u.id === v.approvedBy)?.name || 'Admin',
        subject: v.visitorName,
        detail: `${v.status === 'rejected' ? 'Rejected' : 'Approved'}: ${v.visitorName} — Template: ${v.accessTemplateId || 'None'}`,
        result: v.status === 'rejected' ? 'denied' : 'granted',
        timestamp: v.approvedAt || v.createdAt,
      }));

    const scanEvents = scanLogs.map(s => ({
      id: s.id,
      type: 'scan' as const,
      action: `Door Scan — ${s.accessResult === 'granted' ? 'Access Granted' : 'Access Denied'}`,
      actor: s.visitorName,
      subject: s.deviceName,
      detail: s.reason,
      result: s.accessResult,
      timestamp: s.timestamp,
    }));

    return [...approvalEvents, ...scanEvents]
      .filter(e => {
        const matchSearch = !search || e.actor.toLowerCase().includes(search.toLowerCase()) ||
          e.subject.toLowerCase().includes(search.toLowerCase()) || e.detail.toLowerCase().includes(search.toLowerCase());
        const matchResult = resultFilter === 'all' || e.result === resultFilter;
        return matchSearch && matchResult;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [scanLogs, visitors, users, search, resultFilter]);

  const paged = allLogs.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(allLogs.length / PER_PAGE);

  const exportCSV = () => {
    const rows = ['ID,Type,Action,Actor,Subject,Detail,Result,Timestamp',
      ...allLogs.map(l => `"${l.id}","${l.type}","${l.action}","${l.actor}","${l.subject}","${l.detail}","${l.result}","${new Date(l.timestamp).toLocaleString()}"`)
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Audit Logs</h1>
          <p>Complete audit trail of all access decisions and approvals</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost" onClick={exportCSV}><Download size={14} /> Export CSV</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar" style={{ width: 280 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search actor, device, reason..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 150 }} value={resultFilter} onChange={e => { setResultFilter(e.target.value); setPage(1); }}>
          <option value="all">All Results</option>
          <option value="granted">Granted</option>
          <option value="denied">Denied</option>
        </select>
        <div className="toolbar-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{allLogs.length} events</div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Subject</th>
                <th>Detail</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span className="chip" style={{ background: log.type === 'scan' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)', color: log.type === 'scan' ? 'var(--accent-blue)' : 'var(--accent-purple)' }}>
                      {log.type === 'scan' ? '📡 Scan' : '✏️ Approval'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{log.action}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.actor}</td>
                  <td style={{ fontSize: 12 }}>{log.subject}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.detail}</td>
                  <td><span className={`badge badge-${log.result}`}>{log.result}</span></td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">📜</div><h3>No audit events found</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, allLogs.length)} of {allLogs.length}</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p-1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map(p => (
                <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              {totalPages > 5 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>...</span>}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
