import React, { useState, useEffect } from 'react';
import { useVisitor } from '../../context/VisitorContext';
import { useApp } from '../../context/AppContext';
import { Download, Maximize2, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const QrAnimation: React.FC<{ barcodeId: string }> = ({ barcodeId }) => {
  const [scanning, setScanning] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setScanning(s => !s), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="qr-box">
      <div className={`qr-shimmer${scanning ? ' scanning' : ''}`} />
      <div className="qr-grid">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="qr-cell" style={{ background: Math.random() > 0.5 ? 'var(--qr-dark)' : 'transparent' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', padding: '8px', fontSize: 9, fontFamily: 'monospace', color: '#1e293b', background: 'white', borderTop: '1px solid #e2e8f0', letterSpacing: '0.1em' }}>{barcodeId}</div>
    </div>
  );
};

// Countdown for badge expiry
const BadgeCountdown: React.FC<{ visitDate: string; endTime: string }> = ({ visitDate, endTime }) => {
  const [left, setLeft] = useState('');
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const target = new Date(`${visitDate}T${endTime}:00`);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setLeft('Expired'); setExpired(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLeft(`${h}h ${m}m`);
    };
    tick(); const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [visitDate, endTime]);
  return <span style={{ color: expired ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 700, fontFamily: 'monospace' }}>{left || '—'}</span>;
};

const DigitalBadge: React.FC = () => {
  const { myVisits, visitorProfile } = useVisitor();
  const { accessTemplates } = useApp();
  const [selectedId, setSelectedId] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const approvedVisits = myVisits.filter(v => (v.status === 'approved' || v.status === 'checked-in') && v.barcodeId);
  const visit = approvedVisits.find(v => v.id === selectedId) ?? approvedVisits[0];
  const template = visit ? accessTemplates.find(t => t.id === visit.accessTemplateId) : null;

  const copyId = () => {
    if (visit?.barcodeId) {
      navigator.clipboard.writeText(visit.barcodeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => window.print();

  const BadgeCard = ({ scale = 1 }: { scale?: number }) => (
    <div className="visitor-badge-card" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
      <div className="badge-header-strip" style={{ background: template?.color ?? 'var(--gradient-primary)' }}>
        <div className="badge-company-logo">🏢</div>
        <div>
          <div className="badge-company-name">Enterprise VMS</div>
          <div className="badge-visit-type">{template?.name ?? 'General Visitor'}</div>
        </div>
        <div className="badge-category-chip">{visit?.category?.toUpperCase() ?? 'VISITOR'}</div>
      </div>
      <div className="badge-body">
        <div className="badge-avatar">{visitorProfile?.name?.charAt(0) ?? 'V'}</div>
        <div className="badge-name">{visitorProfile?.name}</div>
        <div className="badge-company-text">{visitorProfile?.company}</div>
        <div className="badge-divider" />
        <div className="badge-info-grid">
          <div className="badge-info-item"><div className="badge-info-label">Host</div><div className="badge-info-value">{visit?.hostName}</div></div>
          <div className="badge-info-item"><div className="badge-info-label">Visit Date</div><div className="badge-info-value">{visit?.visitDate}</div></div>
          <div className="badge-info-item"><div className="badge-info-label">Valid Until</div><div className="badge-info-value">{visit?.endTime}</div></div>
          <div className="badge-info-item"><div className="badge-info-label">Template</div><div className="badge-info-value">{template?.icon} {template?.name ?? '—'}</div></div>
        </div>
        <div className="badge-divider" />
        {visit && <QrAnimation barcodeId={visit.barcodeId!} />}
      </div>
      <div className="badge-footer">
        <span>Valid only on {visit?.visitDate}</span>
        <span style={{ fontFamily: 'monospace', color: template?.color }}>{visit?.barcodeId}</span>
      </div>
    </div>
  );

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left"><h1>Digital Badge & QR Code</h1><p>Your access credentials for this visit</p></div>
        <div className="page-header-actions">
          {approvedVisits.length > 1 && (
            <select className="form-select" value={selectedId || visit?.id || ''} onChange={e => setSelectedId(e.target.value)} style={{ width: 'auto' }}>
              {approvedVisits.map(v => <option key={v.id} value={v.id}>{v.purpose} — {v.visitDate}</option>)}
            </select>
          )}
          <button className="btn btn-ghost" onClick={() => setFullscreen(true)}><Maximize2 size={14} /> Fullscreen</button>
          <button className="btn btn-primary" onClick={handlePrint}><Download size={14} /> Download PDF</button>
        </div>
      </div>

      {approvedVisits.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px' }}>
          <div className="empty-state-icon">🎫</div>
          <h3>No approved visits yet</h3>
          <p>Once your visit is approved, your digital badge will appear here.</p>
        </div>
      ) : (
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <BadgeCard />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Expiry countdown */}
            <div className="card">
              <div className="card-header"><div className="card-title">⏱️ Badge Validity</div></div>
              <div className="info-row"><span className="info-label">Time Remaining</span>
                <span className="info-value">{visit && <BadgeCountdown visitDate={visit.visitDate} endTime={visit.endTime} />}</span></div>
              <div className="info-row"><span className="info-label">Valid On</span><span className="info-value">{visit?.visitDate}</span></div>
              <div className="info-row"><span className="info-label">Access Window</span><span className="info-value">{visit?.visitTime} — {visit?.endTime}</span></div>
              <div className="info-row"><span className="info-label">Escort Required</span><span className="info-value">{template?.requiresEscort ? '✅ Yes' : 'No'}</span></div>
            </div>

            {/* Actions */}
            <div className="card">
              <div className="card-header"><div className="card-title">🔧 Badge Actions</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-ghost btn-full" onClick={copyId}>
                  {copied ? <><Check size={14} /> Copied!</> : <><RefreshCw size={14} /> Copy Barcode ID</>}
                </button>
                <button className="btn btn-ghost btn-full" onClick={() => setFullscreen(true)}><Maximize2 size={14} /> Open Fullscreen</button>
                <button className="btn btn-primary btn-full" onClick={handlePrint}><Download size={14} /> Download / Print Badge</button>
              </div>
            </div>

            {/* Badge ID */}
            {visit?.barcodeId && (
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>Badge ID</div>
                <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: template?.color ?? 'var(--accent-blue)', letterSpacing: '0.1em' }}>{visit.barcodeId}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="modal-overlay" onClick={() => setFullscreen(false)} style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <BadgeCard scale={1.3} />
            <button className="btn btn-ghost" onClick={() => setFullscreen(false)} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>✕ Close Fullscreen</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalBadge;
