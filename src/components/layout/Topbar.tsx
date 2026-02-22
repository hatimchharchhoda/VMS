import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { Bell, Sun, Moon, Check, Trash2 } from 'lucide-react';

const NOTIF_ICONS: Record<string, string> = {
  info: 'ℹ️', warning: '⚠️', error: '🔴', success: '✅'
};

interface TopbarProps { title: string; }

const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications, emergencyMode } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter(n => !n.read).length;

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>

      <div className="topbar-actions">
        {emergencyMode && (
          <div className="emergency-badge">
            <span>🚨</span> EMERGENCY MODE ACTIVE
          </div>
        )}

        {/* Theme Toggle */}
        <button className="topbar-icon-btn" onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification Bell */}
        <div ref={panelRef} style={{ position: 'relative' }}>
          <button className="topbar-icon-btn" onClick={() => setShowNotifs(v => !v)} title="Notifications">
            <Bell size={16} />
            {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>

          {showNotifs && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <span className="notif-panel-title">Notifications {unread > 0 && `(${unread} new)`}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={markAllNotificationsRead} title="Mark all as read">
                    <Check size={12} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={clearNotifications} title="Clear all">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px 20px' }}>
                    <div className="empty-state-icon">🔔</div>
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`notif-item${!n.read ? ' unread' : ''}`}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <div className={`notif-icon ${n.type}`}>{NOTIF_ICONS[n.type]}</div>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">{formatTime(n.timestamp)}</div>
                      </div>
                      {!n.read && <div className="notif-unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
