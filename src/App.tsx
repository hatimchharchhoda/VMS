import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/Login';

import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import VisitorApprovals from './pages/Admin/VisitorApprovals';
import PolicyManagement from './pages/Admin/PolicyManagement';
import AccessTemplates from './pages/Admin/AccessTemplates';
import DeviceManagement from './pages/Admin/DeviceManagement';
import EmergencyControl from './pages/Admin/EmergencyControl';
import Reports from './pages/Admin/Reports';
import AuditLogs from './pages/Admin/AuditLogs';
import HostDelegation from './pages/Admin/HostDelegation';
import MasterData from './pages/Admin/MasterData';

import HostLayout from './pages/Host/HostLayout';
import HostDashboard from './pages/Host/HostDashboard';
import HostApprovals from './pages/Host/HostApprovals';
import InviteVisitor from './pages/Host/InviteVisitor';
import DelegateVisitor from './pages/Host/DelegateVisitor';
import ScanSimulator from './pages/Host/ScanSimulator';
import MovementTracking from './pages/Host/MovementTracking';
import VisitorHistory from './pages/Host/VisitorHistory';
import HostAnalytics from './pages/Host/HostAnalytics';

import VisitorLayout from './pages/Visitor/VisitorLayout';
import VisitorDashboard from './pages/Visitor/VisitorDashboard';
import VisitorRegister from './pages/Visitor/VisitorRegister';
import MyVisits from './pages/Visitor/MyVisits';
import DigitalBadge from './pages/Visitor/DigitalBadge';
import SelfCheckIn from './pages/Visitor/SelfCheckIn';
import AccessVisibility from './pages/Visitor/AccessVisibility';
import VisitHistory from './pages/Visitor/VisitHistory';
import NotificationsCenter from './pages/Visitor/NotificationsCenter';
import EmergencyView from './pages/Visitor/EmergencyView';
import VisitorProfile from './pages/Visitor/VisitorProfile';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />

              {/* Admin Panel */}
              <Route
                path="/admin"
                element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="approvals" element={<VisitorApprovals />} />
                <Route path="policies" element={<PolicyManagement />} />
                <Route path="templates" element={<AccessTemplates />} />
                <Route path="devices" element={<DeviceManagement />} />
                <Route path="emergency" element={<EmergencyControl />} />
                <Route path="delegation" element={<HostDelegation />} />
                <Route path="reports" element={<Reports />} />
                <Route path="audit" element={<AuditLogs />} />
                <Route path="master" element={<MasterData />} />
              </Route>

              {/* Host Panel */}
              <Route
                path="/host"
                element={<ProtectedRoute allowedRole="host"><HostLayout /></ProtectedRoute>}
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<HostDashboard />} />
                <Route path="approvals" element={<HostApprovals />} />
                <Route path="invite" element={<InviteVisitor />} />
                <Route path="delegate" element={<DelegateVisitor />} />
                <Route path="scan" element={<ScanSimulator />} />
                <Route path="movement" element={<MovementTracking />} />
                <Route path="history" element={<VisitorHistory />} />
                <Route path="analytics" element={<HostAnalytics />} />
              </Route>

              {/* Visitor Portal */}
              <Route
                path="/visitor"
                element={<ProtectedRoute allowedRole="visitor"><VisitorLayout /></ProtectedRoute>}
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<VisitorDashboard />} />
                <Route path="register" element={<VisitorRegister />} />
                <Route path="visits" element={<MyVisits />} />
                <Route path="badge" element={<DigitalBadge />} />
                <Route path="checkin" element={<SelfCheckIn />} />
                <Route path="access" element={<AccessVisibility />} />
                <Route path="history" element={<VisitHistory />} />
                <Route path="notifications" element={<NotificationsCenter />} />
                <Route path="emergency" element={<EmergencyView />} />
                <Route path="profile" element={<VisitorProfile />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;