import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, Users, Shield, FileKey, Cpu,
  AlertTriangle, BarChart3, GitBranch, ScrollText,
  Database, UserCheck, Send, UserMinus, ScanLine,
  MoveDiagonal, History, TrendingUp, LogOut
} from 'lucide-react';

const ADMIN_LINKS = [
  { section: 'Overview', items: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/approvals', icon: UserCheck, label: 'Visitor Approvals', badge: 'pending' },
  ]},
  { section: 'Access Control', items: [
    { to: '/admin/policies', icon: Shield, label: 'Policy Management' },
    { to: '/admin/templates', icon: FileKey, label: 'Access Templates' },
    { to: '/admin/devices', icon: Cpu, label: 'Devices & Doors' },
  ]},
  { section: 'Operations', items: [
    { to: '/admin/emergency', icon: AlertTriangle, label: 'Emergency Control' },
    { to: '/admin/delegation', icon: GitBranch, label: 'Host Delegation' },
  ]},
  { section: 'Intelligence', items: [
    { to: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics' },
    { to: '/admin/audit', icon: ScrollText, label: 'Audit Logs' },
    { to: '/admin/master', icon: Database, label: 'Master Data' },
  ]},
];

const HOST_LINKS = [
  { section: 'Overview', items: [
    { to: '/host/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
  ]},
  { section: 'Visitor Management', items: [
    { to: '/host/approvals', icon: UserCheck, label: 'Approve Visitors', badge: 'pending' },
    { to: '/host/invite', icon: Send, label: 'Invite Visitor' },
    { to: '/host/delegate', icon: UserMinus, label: 'Delegate Visitor' },
  ]},
  { section: 'Monitoring', items: [
    { to: '/host/scan', icon: ScanLine, label: 'Scan Simulator' },
    { to: '/host/movement', icon: MoveDiagonal, label: 'Movement Tracking' },
    { to: '/host/history', icon: History, label: 'Visitor History' },
    { to: '/host/analytics', icon: TrendingUp, label: 'My Analytics' },
  ]},
];

interface SidebarProps { role: 'admin' | 'host'; }

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const { user, logout } = useAuth();
  const { visitors, notifications, emergencyMode } = useApp();
  const navigate = useNavigate();

  const links = role === 'admin' ? ADMIN_LINKS : HOST_LINKS;
  const pendingCount = visitors.filter(v =>
    v.status === 'pending' &&
    (role === 'admin' || v.hostId === user?.id)
  ).length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">🏢</div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">Enterprise VMS</div>
          <div className="sidebar-brand-sub">{role === 'admin' ? 'Control Center' : 'Host Portal'}</div>
        </div>
      </div>

      {emergencyMode && (
        <div style={{ padding: '8px 12px', background: 'rgba(220,38,38,0.12)', borderBottom: '1px solid rgba(220,38,38,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="dot dot-red dot-pulse"></span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f43f5e' }}>EMERGENCY ACTIVE</span>
        </div>
      )}

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {links.map(section => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-link-icon">
                  <item.icon size={16} strokeWidth={2} />
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge === 'pending' && pendingCount > 0 && (
                  <span className="sidebar-link-badge">{pendingCount}</span>
                )}
                {item.label === 'Notifications' && unreadNotifs > 0 && (
                  <span className="sidebar-link-badge">{unreadNotifs}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{user?.avatar || user?.name?.slice(0, 2)}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">{user?.department || role}</div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: 28, height: 28, borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          title="Logout"
        >
          <LogOut size={13} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
