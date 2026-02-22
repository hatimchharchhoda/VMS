import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

const PAGE_TITLES: Record<string, string> = {
  '/host/dashboard': 'My Dashboard',
  '/host/approvals': 'Approve Visitors',
  '/host/invite': 'Invite Visitor',
  '/host/delegate': 'Delegate Visitor',
  '/host/scan': 'Barcode Scan Simulator',
  '/host/movement': 'Visitor Movement Tracking',
  '/host/history': 'Visitor History',
  '/host/analytics': 'My Analytics',
};

const HostLayout: React.FC = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Host Portal';

  return (
    <div className="app-layout">
      <Sidebar role="host" />
      <div className="main-content-area">
        <Topbar title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default HostLayout;