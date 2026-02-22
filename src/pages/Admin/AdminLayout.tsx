import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useApp } from '../../context/AppContext';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/approvals': 'Visitor Approvals',
  '/admin/policies': 'Policy Management',
  '/admin/templates': 'Access Templates',
  '/admin/devices': 'Devices & Door Management',
  '/admin/emergency': 'Emergency Control Center',
  '/admin/delegation': 'Host Delegation Control',
  '/admin/reports': 'Reports & Analytics',
  '/admin/audit': 'Audit Logs',
  '/admin/master': 'Master Data Configuration',
};

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { emergencyMode } = useApp();
  const title = PAGE_TITLES[location.pathname] || 'Admin Panel';

  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <div className="main-content-area" style={emergencyMode ? { paddingTop: 'calc(var(--topbar-height) + 40px)' } : {}}>
        <Topbar title={title} />
        {emergencyMode && (
          <div className="emergency-overlay-banner">
            <span>🚨 EMERGENCY MODE ACTIVE — All standard access policies overridden — Lockdown in effect</span>
            <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>Navigate to Emergency Control to manage</span>
          </div>
        )}
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
