import React from 'react';
import { useApp } from '../../context/AppContext';
import { Check, Trash2 } from 'lucide-react';

const NOTIF_ICONS: Record<string, string> = {
  info: 'ℹ️', warning: '⚠️', error: '🚨', success: '✅',
};

const NotificationsCenter: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useApp();

  const unread = notifications.filter(n => !n.read).length;
  const sorted = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const bgByType = { info: 'rgba(59,130,246,0.05)', warning: 'rgba(245,158,11,0.06)', error: 'rgba(244,63,94,0.06)', success: 'rgba(16,185,129,0.05)' };
  const colorByType = { info: '#3b82f6', warning: '#f59e0b', error: '#f43f5e', success: '#10b981' };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Notifications</h1>
          <p>{unread > 0 ? `${unread} unread notifications` : 'All caught up! No new notifications.'}</p>
        </div>
        <div className="page-header-actions">
          {unread > 0 && <button className="btn btn-ghost btn-sm" onClick={markAllNotificationsRead}><Check size={13} /> Mark all read</button>}
          {notifications.length > 0 && <button className="btn btn-danger btn-sm" onClick={clearNotifications}><Trash2 size={13} /> Clear all</button>}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state" style={{ padding: '100px' }}>
          <div className="empty-state-icon">🔔</div>
          <h3>No notifications</h3>
          <p>You'll see approval alerts, visit updates, and emergency notices here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map(n => (
            <div
              key={n.id}
              onClick={() => !n.read && markNotificationRead(n.id)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', background: n.read ? 'var(--bg-card)' : (bgByType as Record<string, string>)[n.type], border: `1px solid ${n.read ? 'var(--border-color)' : (colorByType as Record<string, string>)[n.type] + '33'}`, borderRadius: 12, cursor: n.read ? 'default' : 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: (colorByType as Record<string, string>)[n.type] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {NOTIF_ICONS[n.type] ?? '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: 'var(--text-primary)', marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{timeAgo(n.timestamp)}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: (colorByType as Record<string, string>)[n.type], flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
