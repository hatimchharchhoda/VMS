/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import adminsData from './data/admin.json';
import visitorsData from './data/visitors.json';
import locationsData from './data/locations.json';
import './AdminDashboard.css';

interface Admin {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  assignedLocations: string[];
}

interface Visitor {
  id: string;
  visitorName: string;
  email: string;
  phone: string;
  purpose: string;
  host: string;
  locationId: string;
  visitDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'pending' | 'checked-in' | 'checked-out';
}

interface Location {
  id: string;
  name: string;
  address: string;
  active: boolean;
  adminNotes: string;
}

const AdminDashboard: React.FC = () => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>(() => visitorsData as unknown as Visitor[]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [showVisitorModal, setShowVisitorModal] = useState<boolean>(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const admins: Admin[] = adminsData;
  const locations: Location[] = locationsData;

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentAdmin) {
      applyFilters();
    }
  }, [currentAdmin, visitors, statusFilter, searchTerm]);

  const updateDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    setCurrentDateTime(now.toLocaleDateString('en-US', options));
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const admin = admins.find(
      (a) => a.email === email && a.password === password
    );

    if (admin) {
      setCurrentAdmin(admin);
      setLoginError('');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
    setLoginError('');
  };

  const applyFilters = () => {
    if (!currentAdmin) return;

    const adminVisitors = visitors.filter((v) =>
      currentAdmin.assignedLocations.includes(v.locationId)
    );

    const filtered = adminVisitors.filter((visitor) => {
      const matchesStatus =
        statusFilter === 'all' || visitor.status === statusFilter;
      const matchesSearch =
        visitor.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.phone.includes(searchTerm) ||
        visitor.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.host.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });

    setFilteredVisitors(filtered);
  };

  const checkIn = (visitorId: string) => {
    setVisitors((prevVisitors) =>
      prevVisitors.map((v) =>
        v.id === visitorId
          ? {
              ...v,
              checkInTime: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              status: 'checked-in' as const,
            }
          : v
      )
    );
  };

  const checkOut = (visitorId: string) => {
    setVisitors((prevVisitors) =>
      prevVisitors.map((v) =>
        v.id === visitorId
          ? {
              ...v,
              checkOutTime: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              status: 'checked-out' as const,
            }
          : v
      )
    );
  };

  const cancelVisit = (visitorId: string) => {
    if (window.confirm('Are you sure you want to cancel this visit?')) {
      setVisitors((prevVisitors) =>
        prevVisitors.filter((v) => v.id !== visitorId)
      );
    }
  };

  const viewVisitorDetails = (visitorId: string) => {
    const visitor = visitors.find((v) => v.id === visitorId);
    if (visitor) {
      setSelectedVisitor(visitor);
      setShowVisitorModal(true);
    }
  };

  const getStats = () => {
    if (!currentAdmin) return { today: 0, pending: 0, checkedIn: 0, activeLocations: 0 };

    const adminLocations = locations.filter((loc) =>
      currentAdmin.assignedLocations.includes(loc.id)
    );
    const adminVisitors = visitors.filter((v) =>
      currentAdmin.assignedLocations.includes(v.locationId)
    );

    const todayDate = new Date().toISOString().split('T')[0];
    const todayVisitors = adminVisitors.filter((v) => v.visitDate === todayDate);
    const pendingVisitors = adminVisitors.filter((v) => v.status === 'pending');
    const checkedInVisitors = adminVisitors.filter((v) => v.status === 'checked-in');
    const activeLocations = adminLocations.filter((loc) => loc.active);

    return {
      today: todayVisitors.length,
      pending: pendingVisitors.length,
      checkedIn: checkedInVisitors.length,
      activeLocations: activeLocations.length,
      totalLocations: adminLocations.length,
    };
  };

  const getAdminLocations = () => {
    if (!currentAdmin) return [];
    return locations.filter((loc) =>
      currentAdmin.assignedLocations.includes(loc.id)
    );
  };

  if (!currentAdmin) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>Visitor Management System</h1>
            <p>Admin Portal Login</p>
          </div>
          {loginError && <div className="login-error">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="admin@company.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>
          <div className="demo-credentials">
            <strong>Demo Credentials:</strong>
            <br />
            Email: admin@company.com
            <br />
            Password: admin123
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p>{currentDateTime}</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="name">{currentAdmin.name}</div>
            <div className="role">{currentAdmin.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label">Today's Visitors</div>
            <div className="stat-icon" style={{ background: 'rgba(0, 217, 255, 0.15)' }}>
              📅
            </div>
          </div>
          <div className="stat-value">{stats.today}</div>
          <div className="stat-trend">{stats.today} scheduled</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label">Pending Check-ins</div>
            <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.15)' }}>
              ⏳
            </div>
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-trend">Awaiting arrival</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label">Currently On-site</div>
            <div className="stat-icon" style={{ background: 'rgba(0, 230, 118, 0.15)' }}>
              ✅
            </div>
          </div>
          <div className="stat-value">{stats.checkedIn}</div>
          <div className="stat-trend">Active now</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label">Active Locations</div>
            <div className="stat-icon" style={{ background: 'rgba(0, 230, 118, 0.15)' }}>
              📍
            </div>
          </div>
          <div className="stat-value">{stats.activeLocations}</div>
          <div className="stat-trend">{stats.totalLocations} total assigned</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="quick-action-card" onClick={() => setStatusFilter('all')}>
          <div className="quick-action-icon">📊</div>
          <div className="quick-action-label">All Visitors</div>
        </div>
        <div className="quick-action-card" onClick={() => setStatusFilter('pending')}>
          <div className="quick-action-icon">⏳</div>
          <div className="quick-action-label">Pending Check-ins</div>
        </div>
        <div className="quick-action-card" onClick={() => setStatusFilter('checked-in')}>
          <div className="quick-action-icon">✅</div>
          <div className="quick-action-label">Checked In</div>
        </div>
        <div className="quick-action-card" onClick={() => setShowLocationModal(true)}>
          <div className="quick-action-icon">📍</div>
          <div className="quick-action-label">Locations</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-card">
          <div className="card-header">
            <h2>Visitor Management</h2>
            <div className="card-actions">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="checkedin">Checked In</option>
                <option value="checkedout">Checked Out</option>
              </select>
              <input
                type="text"
                className="search-input"
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Visitor Details</th>
                  <th>Contact</th>
                  <th>Purpose</th>
                  <th>Host</th>
                  <th>Visit Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <div>No visitors found matching your criteria</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td>
                        <div className="visitor-name">{visitor.visitorName}</div>
                        <div className="visitor-email">ID: {visitor.id}</div>
                      </td>
                      <td>
                        <div>{visitor.email}</div>
                        <div className="visitor-email">{visitor.phone}</div>
                      </td>
                      <td>{visitor.purpose}</td>
                      <td>{visitor.host}</td>
                      <td>
                        <div>{visitor.visitDate}</div>
                        {visitor.checkInTime && (
                          <div className="visitor-email">In: {visitor.checkInTime}</div>
                        )}
                        {visitor.checkOutTime && (
                          <div className="visitor-email">Out: {visitor.checkOutTime}</div>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${visitor.status}`}>
                          {visitor.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          {visitor.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-success"
                                onClick={() => checkIn(visitor.id)}
                              >
                                Check In
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => cancelVisit(visitor.id)}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {visitor.status === 'checked-in' && (
                            <button
                              className="btn btn-primary"
                              onClick={() => checkOut(visitor.id)}
                            >
                              Check Out
                            </button>
                          )}
                          {visitor.status === 'checked-out' && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => viewVisitorDetails(visitor.id)}
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal" onClick={() => setShowLocationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Location Details</h3>
              <button
                className="close-modal"
                onClick={() => setShowLocationModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="location-info">
              <div className="location-grid">
                {getAdminLocations().map((loc) => (
                  <div className="location-item" key={loc.id}>
                    <div className="location-header">
                      <div className="location-name">{loc.name}</div>
                      <span
                        className={`location-status ${
                          loc.active ? 'location-active' : 'location-inactive'
                        }`}
                      >
                        {loc.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="location-address">{loc.address}</div>
                    {loc.adminNotes && (
                      <div className="location-notes">{loc.adminNotes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Details Modal */}
      {showVisitorModal && selectedVisitor && (
        <div className="modal" onClick={() => setShowVisitorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Visitor Details</h3>
              <button
                className="close-modal"
                onClick={() => setShowVisitorModal(false)}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="form-group">
                <label>Visitor Name</label>
                <div className="detail-value">{selectedVisitor.visitorName}</div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="detail-value">{selectedVisitor.email}</div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <div className="detail-value">{selectedVisitor.phone}</div>
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <div className="detail-value">{selectedVisitor.purpose}</div>
              </div>
              <div className="form-group">
                <label>Host</label>
                <div className="detail-value">{selectedVisitor.host}</div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <div className="detail-value">
                  {locations.find((l) => l.id === selectedVisitor.locationId)?.name ||
                    'Unknown'}
                </div>
              </div>
              <div className="form-group">
                <label>Visit Date</label>
                <div className="detail-value">{selectedVisitor.visitDate}</div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <div className="detail-value">
                  <span className={`status-badge status-${selectedVisitor.status}`}>
                    {selectedVisitor.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              {selectedVisitor.checkInTime && (
                <div className="form-group">
                  <label>Check-in Time</label>
                  <div className="detail-value">{selectedVisitor.checkInTime}</div>
                </div>
              )}
              {selectedVisitor.checkOutTime && (
                <div className="form-group">
                  <label>Check-out Time</label>
                  <div className="detail-value">{selectedVisitor.checkOutTime}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;