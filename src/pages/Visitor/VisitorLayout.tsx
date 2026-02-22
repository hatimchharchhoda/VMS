import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { VisitorProvider } from '../../context/VisitorContext';
import {
  LayoutDashboard, FilePlus, CheckSquare, QrCode,
  KeyRound, History, Bell, AlertTriangle, UserCircle,
  LogOut, Sun, Moon, ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'My Dashboard', to: '/visitor/dashboard' },
  { icon: FilePlus, label: 'Register Visit', to: '/visitor/register' },
  { icon: CheckSquare, label: 'My Visits', to: '/visitor/visits' },
  { icon: QrCode, label: 'Digital Badge', to: '/visitor/badge' },
  { icon: KeyRound, label: 'Self Check-In', to: '/visitor/checkin' },
  { icon: ShieldCheck, label: 'Access Visibility', to: '/visitor/access' },
  { icon: History, label: 'Visit History', to: '/visitor/history' },
  { icon: Bell, label: 'Notifications', to: '/visitor/notifications' },
  { icon: AlertTriangle, label: 'Emergency', to: '/visitor/emergency' },
  { icon: UserCircle, label: 'My Profile', to: '/visitor/profile' },
];

const VisitorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, emergencyMode } = useApp();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <VisitorProvider>
      <div className="app-layout">
        {/* Visitor Sidebar */}
        <aside className="sidebar visitor-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', fontSize: 22 }}>🎫</div>
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-name">Visitor Portal</div>
              <div className="sidebar-brand-sub">Access System</div>
            </div>
          </div>

          {emergencyMode && (
            <div style={{ margin: '12px 8px', padding: '10px 12px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.35)', borderRadius: 8, fontSize: 12, color: 'var(--accent-rose)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, animation: 'pulse-emergency 1.5s infinite' }}>
              🚨 Emergency Active
            </div>
          )}

          <div className="sidebar-section">
            <div className="sidebar-section-label">Navigation</div>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                <div className="sidebar-link-icon"><item.icon size={16} /></div>
                <span>{item.label}</span>
                {item.label === 'Notifications' && unread > 0 && (
                  <span className="sidebar-link-badge">{unread}</span>
                )}
                {item.label === 'Emergency' && emergencyMode && (
                  <span className="sidebar-link-badge" style={{ background: 'var(--accent-rose)' }}>!</span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
              {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">Visitor</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="main-content-area">
          {/* Topbar */}
          <header className="topbar" style={{ left: 'var(--sidebar-width)' }}>
            <div className="topbar-title" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
              Visitor Management & Access Control System
            </div>
            <div className="topbar-actions">
              {emergencyMode && (
                <div className="emergency-badge"><AlertTriangle size={13} /> EMERGENCY</div>
              )}
              <button className="topbar-icon-btn" onClick={toggleTheme} title="Toggle theme">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <NavLink to="/visitor/notifications" className="topbar-icon-btn" style={{ textDecoration: 'none' }}>
                <Bell size={16} />
                {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
              </NavLink>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>
                  {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0]}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user?.company}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Emergency Banner */}
          {emergencyMode && (
            <div className="emergency-overlay-banner" style={{ left: 'var(--sidebar-width)' }}>
              <span>🚨 EMERGENCY MODE ACTIVE — Follow evacuation instructions immediately</span>
              <NavLink to="/visitor/emergency" style={{ color: 'white', textDecoration: 'underline', fontSize: 12 }}>View instructions →</NavLink>
            </div>
          )}

          <main className={`page-content${emergencyMode ? ' has-emergency-banner' : ''}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </VisitorProvider>
  );
};

export default VisitorLayout;
