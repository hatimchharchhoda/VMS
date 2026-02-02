/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dummyVisitsData from "./data/dummyVisits.json";

interface VisitRequest {
  id: string;
  visitorName: string;
  email: string;
  mobile: string;
  numberOfVisitors: number;
  accompaniedVisitors: { name: string; mobile: string }[];
  personToMeet: string;
  personDepartment: string;
  personContact: string;
  visitPurpose: string;
  visitDate: string;
  visitTimeFrom: string;
  visitTimeTo: string;
  location: string;
  vehicleNumber?: string;
  status: "pending" | "approved" | "rejected";
  qrCode?: string;
  createdAt: string;
}

const VisitorHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (role !== "visitor" || !userData) {
      window.location.replace("/");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Load existing visits from localStorage
    const existingVisits: VisitRequest[] = JSON.parse(
      localStorage.getItem("visitRequests") || "[]"
    );

    // If no visits exist in localStorage, load dummy data
    if (existingVisits.length === 0) {
      // Filter dummy data to match current user's email
      const userDummyVisits = (dummyVisitsData as VisitRequest[]).map(visit => ({
        ...visit,
        email: parsedUser.email,
        visitorName: parsedUser.name
      }));
      
      // Save dummy data to localStorage for persistence
      localStorage.setItem("visitRequests", JSON.stringify(userDummyVisits));
      
      const sortedVisits = userDummyVisits.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setVisits(sortedVisits);
    } else {
      // Filter and sort existing visits
      const myVisits = existingVisits
        .filter((v) => v.email === parsedUser.email)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setVisits(myVisits);
    }

    setIsLoading(false);
  }, []);

  const createTemplate = (visit: VisitRequest) => {
    // Create a template with all the visit details
    const template = {
      visitorName: visit.visitorName,
      email: visit.email,
      mobile: visit.mobile,
      numberOfVisitors: visit.numberOfVisitors,
      accompaniedVisitors: visit.accompaniedVisitors,
      personToMeet: visit.personToMeet,
      personDepartment: visit.personDepartment,
      personContact: visit.personContact,
      visitPurpose: visit.visitPurpose,
      location: visit.location,
      vehicleNumber: visit.vehicleNumber || "",
    };

    localStorage.setItem("visitTemplate", JSON.stringify(template));
    navigate("/visitor/register");
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("visitTemplate");
    window.location.replace("/");
  };

  const clearAllVisits = () => {
    if (window.confirm("Are you sure you want to clear all visit history?")) {
      localStorage.removeItem("visitRequests");
      setVisits([]);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: "#64748b", marginTop: "16px" }}>Loading your visits...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.navbar}>
        <div style={styles.navContent}>
          <div>
            <h1 style={styles.title}>Welcome back, {user?.name}! 👋</h1>
            <p style={styles.subtitle}>
              Manage your visit history & quick re-registration
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              style={styles.secondaryBtn}
              onClick={clearAllVisits}
              title="Clear all visit history"
            >
              🗑️ Clear History
            </button>
            <button
              style={styles.primaryBtn}
              onClick={() => {
                localStorage.removeItem("visitTemplate");
                navigate("/visitor/register");
              }}
            >
              ✨ New Visit Request
            </button>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: "6px" }}
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIcon} style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            ✓
          </div>
          <div>
            <div style={styles.statValue}>
              {visits.filter((v) => v.status === "approved").length}
            </div>
            <div style={styles.statLabel}>Approved</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon} style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            ⏱
          </div>
          <div>
            <div style={styles.statValue}>
              {visits.filter((v) => v.status === "pending").length}
            </div>
            <div style={styles.statLabel}>Pending</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon} style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
            ✕
          </div>
          <div>
            <div style={styles.statValue}>
              {visits.filter((v) => v.status === "rejected").length}
            </div>
            <div style={styles.statLabel}>Rejected</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon} style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
            📊
          </div>
          <div>
            <div style={styles.statValue}>{visits.length}</div>
            <div style={styles.statLabel}>Total Visits</div>
          </div>
        </div>
      </div>

      {/* Visit History */}
      <div style={styles.content}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📋 Visit History</h2>
          <p style={styles.sectionSubtitle}>
            Click on any visit to use it as a template for quick re-registration
          </p>
        </div>

        {visits.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No visits found</h3>
            <p style={styles.emptyText}>
              You haven't made any visit requests yet. Start by creating your first visit request!
            </p>
            <button
              style={styles.primaryBtn}
              onClick={() => {
                localStorage.removeItem("visitTemplate");
                navigate("/visitor/register");
              }}
            >
              Create First Visit
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {visits.map((visit) => (
              <div key={visit.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.location}>🏢 {visit.location}</span>
                  <span
                    style={{
                      ...styles.status,
                      ...(visit.status === "approved"
                        ? styles.approved
                        : visit.status === "rejected"
                        ? styles.rejected
                        : styles.pending),
                    }}
                  >
                    {visit.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={styles.meet}>Meeting: {visit.personToMeet}</h3>
                <p style={styles.department}>
                  {visit.personDepartment && `${visit.personDepartment} Department`}
                </p>

                <div style={styles.visitDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailIcon}>📅</span>
                    <span style={styles.detailText}>{visit.visitDate}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailIcon}>⏰</span>
                    <span style={styles.detailText}>
                      {visit.visitTimeFrom} – {visit.visitTimeTo}
                    </span>
                  </div>
                  {visit.numberOfVisitors > 1 && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailIcon}>👥</span>
                      <span style={styles.detailText}>
                        {visit.numberOfVisitors} visitors
                      </span>
                    </div>
                  )}
                  {visit.vehicleNumber && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailIcon}>🚗</span>
                      <span style={styles.detailText}>{visit.vehicleNumber}</span>
                    </div>
                  )}
                </div>

                <p style={styles.purpose}>
                  <strong>Purpose:</strong> {visit.visitPurpose}
                </p>

                <div style={styles.cardFooter}>
                  <span style={styles.requestId}>ID: {visit.id}</span>
                  <button
                    style={styles.templateBtn}
                    onClick={() => createTemplate(visit)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ marginRight: "6px" }}
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    Use as Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorHome;

/* ================= STYLES ================= */

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)",
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)",
  },

  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  navbar: {
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  navContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "24px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },

  subtitle: {
    marginTop: "6px",
    color: "#64748b",
    fontSize: "15px",
  },

  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  primaryBtn: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "15px",
    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.4), 0 2px 4px -1px rgba(37, 99, 235, 0.3)",
    transition: "all 0.3s ease",
  },

  secondaryBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    background: "#ffffff",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },

  logoutBtn: {
    padding: "10px 20px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: "#475569",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
  },

  statsContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "32px 40px 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },

  statCard: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  },

  statIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#ffffff",
    fontWeight: "700",
  },

  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 1,
  },

  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "4px",
    fontWeight: "500",
  },

  content: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px",
  },

  sectionHeader: {
    marginBottom: "28px",
  },

  sectionTitle: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
  },

  sectionSubtitle: {
    margin: 0,
    fontSize: "15px",
    color: "#64748b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },

  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid #f1f5f9",
  },

  location: {
    fontWeight: 600,
    color: "#334155",
    fontSize: "15px",
  },

  status: {
    padding: "5px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.05em",
  },

  approved: {
    background: "#dcfce7",
    color: "#166534",
  },

  pending: {
    background: "#fef9c3",
    color: "#854d0e",
  },

  rejected: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  meet: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
  },

  department: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },

  visitDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px 0",
  },

  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  detailIcon: {
    fontSize: "14px",
  },

  detailText: {
    fontSize: "14px",
    color: "#475569",
  },

  purpose: {
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.6",
    margin: 0,
    paddingTop: "8px",
    borderTop: "1px solid #f1f5f9",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
  },

  requestId: {
    fontSize: "12px",
    color: "#94a3b8",
    fontFamily: "monospace",
    fontWeight: "600",
  },

  templateBtn: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1.5px solid #2563eb",
    background: "#ffffff",
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
  },

  emptyState: {
    textAlign: "center",
    padding: "80px 40px",
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
  },

  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },

  emptyTitle: {
    margin: "0 0 12px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
  },

  emptyText: {
    margin: "0 0 28px 0",
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
  },
};