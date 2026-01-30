import { useState, useEffect } from "react";
import QRCode from "qrcode";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    visitorName: "",
    email: "",
    mobile: "",
    numberOfVisitors: 1,
    accompaniedVisitors: [] as { name: string; mobile: string }[],
    personToMeet: "",
    personDepartment: "",
    personContact: "",
    visitPurpose: "",
    visitDate: "",
    visitTimeFrom: "",
    visitTimeTo: "",
    location: "Main Office",
    vehicleNumber: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (role !== "visitor" || !userData) {
      window.location.replace("/");
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData((prev) => ({
        ...prev,
        visitorName: parsed.name,
        email: parsed.email,
      }));
    } catch (error) {
      console.error("Error parsing user data:", error);
      window.location.replace("/");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberOfVisitorsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const count = parseInt(e.target.value) || 1;
    setFormData((prev) => {
      const newAccompanied = Array.from(
        { length: Math.max(0, count - 1) },
        (_, i) => prev.accompaniedVisitors[i] || { name: "", mobile: "" },
      );
      return {
        ...prev,
        numberOfVisitors: count,
        accompaniedVisitors: newAccompanied,
      };
    });
  };

  const handleAccompaniedVisitorChange = (
    index: number,
    field: "name" | "mobile",
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.accompaniedVisitors];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, accompaniedVisitors: updated };
    });
  };

  const generateQRCode = async (requestId: string, data: VisitRequest) => {
    try {
      const qrData = JSON.stringify({
        id: requestId,
        visitor: data.visitorName,
        date: data.visitDate,
        time: `${data.visitTimeFrom} - ${data.visitTimeTo}`,
        meeting: data.personToMeet,
      });

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#1e293b",
          light: "#FFFFFF",
        },
      });

      return qrUrl;
    } catch (err) {
      console.error("QR generation error:", err);
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.mobile ||
      !formData.personToMeet ||
      !formData.visitDate ||
      !formData.visitTimeFrom ||
      !formData.visitTimeTo ||
      !formData.visitPurpose
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.numberOfVisitors > 1) {
      const allFilled = formData.accompaniedVisitors.every(
        (v) => v.name.trim() && v.mobile.trim(),
      );
      if (!allFilled) {
        alert("Please fill details for all accompanied visitors");
        return;
      }
    }

    const requestId = `VIS-${Date.now()}`;
    const visitRequest: VisitRequest = {
      id: requestId,
      ...formData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const qrUrl = await generateQRCode(requestId, visitRequest);
    visitRequest.qrCode = qrUrl;

    const existingRequests = JSON.parse(
      localStorage.getItem("visitRequests") || "[]",
    );
    existingRequests.push(visitRequest);
    localStorage.setItem("visitRequests", JSON.stringify(existingRequests));

    setQrCodeUrl(qrUrl);
    setCurrentRequestId(requestId);
    setShowQR(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.replace("/");
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.download = `visitor-pass-${currentRequestId}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: "#64748b", marginTop: "16px" }}>Loading...</p>
      </div>
    );
  }

  if (showQR) {
    return (
      <div style={styles.container}>
        <div style={styles.qrCard}>
          <div style={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#10b981" opacity="0.1" />
              <circle cx="32" cy="32" r="24" fill="#10b981" opacity="0.2" />
              <path
                d="M20 32L28 40L44 24"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 style={styles.successTitle}>Request Submitted!</h2>
          <p style={styles.successSubtitle}>
            Your visit request has been successfully submitted
          </p>

          <div style={styles.requestIdBox}>
            <span style={styles.requestIdLabel}>Request ID</span>
            <span style={styles.requestIdValue}>{currentRequestId}</span>
          </div>

          <div style={styles.qrBox}>
            <img
              src={qrCodeUrl}
              alt="Visitor QR Code"
              style={{ width: "100%", display: "block" }}
            />
          </div>

          <p style={styles.qrInstruction}>
            📱 Save this QR code for check-in once your request is approved
          </p>

          <button onClick={downloadQR} style={styles.downloadBtn}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: "8px" }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download QR Code
          </button>

          <button
            onClick={() => {
              setShowQR(false);
              setFormData({
                visitorName: user?.name || "",
                email: user?.email || "",
                mobile: "",
                numberOfVisitors: 1,
                accompaniedVisitors: [],
                personToMeet: "",
                personDepartment: "",
                personContact: "",
                visitPurpose: "",
                visitDate: "",
                visitTimeFrom: "",
                visitTimeTo: "",
                location: "Main Office",
                vehicleNumber: "",
              });
            }}
            style={styles.newRequestBtn}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.navBrand}>
            <div style={styles.brandIcon}>🏢</div>
            <div>
              <h1 style={styles.brandTitle}>Visitor Management</h1>
              <p style={styles.brandSubtitle}>Registration Portal</p>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
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

      <div style={styles.formWrapper}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>New Visit Request</h2>
            <p style={styles.formDescription}>
              Please fill in all required details to submit your visit request
            </p>
          </div>

          {/* Personal Information */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>👤</div>
              <h3 style={styles.sectionTitle}>Personal Information</h3>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Full Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="visitorName"
                  value={formData.visitorName}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Email Address <span style={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Mobile Number <span style={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXXXXXXX"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Number of Visitors <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="numberOfVisitors"
                  value={formData.numberOfVisitors}
                  onChange={handleNumberOfVisitorsChange}
                  min="1"
                  max="10"
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          {/* Accompanied Visitors */}
          {formData.numberOfVisitors > 1 && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIcon}>👥</div>
                <h3 style={styles.sectionTitle}>Accompanied Visitors</h3>
              </div>
              {formData.accompaniedVisitors.map((visitor, index) => (
                <div key={index} style={styles.accompaniedCard}>
                  <div style={styles.visitorBadge}>Visitor {index + 2}</div>
                  <div style={styles.accompaniedFields}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={visitor.name}
                      onChange={(e) =>
                        handleAccompaniedVisitorChange(
                          index,
                          "name",
                          e.target.value,
                        )
                      }
                      style={{ ...styles.input, flex: 1 }}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={visitor.mobile}
                      onChange={(e) =>
                        handleAccompaniedVisitorChange(
                          index,
                          "mobile",
                          e.target.value,
                        )
                      }
                      style={{ ...styles.input, flex: 1 }}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Person to Meet */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>🤝</div>
              <h3 style={styles.sectionTitle}>Person to Meet</h3>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="personToMeet"
                  value={formData.personToMeet}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter person's name"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Department</label>
                <input
                  type="text"
                  name="personDepartment"
                  value={formData.personDepartment}
                  onChange={handleInputChange}
                  placeholder="e.g., HR, IT, Sales"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Contact Number</label>
              <input
                type="tel"
                name="personContact"
                value={formData.personContact}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
          </div>

          {/* Visit Details */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>📅</div>
              <h3 style={styles.sectionTitle}>Visit Details</h3>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Purpose of Visit <span style={styles.required}>*</span>
              </label>
              <textarea
                name="visitPurpose"
                value={formData.visitPurpose}
                onChange={handleInputChange}
                rows={3}
                style={styles.textarea}
                placeholder="Please describe the purpose of your visit..."
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Visit Date <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Location <span style={styles.required}>*</span>
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="Main Office">Main Office</option>
                  <option value="Branch Office">Branch Office</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Factory">Factory</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Time From <span style={styles.required}>*</span>
                </label>
                <input
                  type="time"
                  name="visitTimeFrom"
                  value={formData.visitTimeFrom}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Time To <span style={styles.required}>*</span>
                </label>
                <input
                  type="time"
                  name="visitTimeTo"
                  value={formData.visitTimeTo}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Vehicle Number (Optional)</label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                placeholder="e.g., GJ01AB1234"
                style={styles.input}
              />
            </div>
          </div>

          <button onClick={handleSubmit} style={styles.submitBtn}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: "8px" }}
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Submit Visit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorHome;

const styles: { [key: string]: React.CSSProperties } = {
  /* ================= PAGE LAYOUT ================= */
  container: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(to bottom, #f1f5f9 0%, #e2e8f0 100%)",
    display: "flex",
    flexDirection: "column",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to bottom, #f1f5f9 0%, #e2e8f0 100%)",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  /* ================= NAVBAR ================= */
  navbar: {
    width: "100%",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navContent: {
    width: "90%",
    maxWidth: "1200px",
    margin: "0 auto",
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  brandIcon: {
    width: "46px",
    height: "46px",
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    boxShadow:
      "0 4px 6px -1px rgba(37, 99, 235, 0.3), 0 2px 4px -1px rgba(37, 99, 235, 0.2)",
  },
  brandTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  brandSubtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
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
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },

  /* ================= FORM WRAPPER ================= */
  formWrapper: {
    flex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
  },
  formContainer: {
    width: "100%",
    maxWidth: "1000px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },

  /* ================= FORM HEADER ================= */
  formHeader: {
    marginBottom: "36px",
    paddingBottom: "24px",
    borderBottom: "2px solid #f1f5f9",
  },
  formTitle: {
    margin: "0 0 8px 0",
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  formDescription: {
    margin: 0,
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
  },

  /* ================= SECTIONS ================= */
  section: {
    marginBottom: "32px",
    paddingBottom: "28px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  sectionIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    boxShadow: "0 1px 3px 0 rgba(37, 99, 235, 0.1)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },

  /* ================= FORM FIELDS ================= */
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    letterSpacing: "-0.01em",
  },
  required: {
    color: "#dc2626",
    fontWeight: "700",
  },

  /* ================= INPUTS ================= */
  input: {
    padding: "11px 14px",
    border: "1.5px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    background: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
  select: {
    padding: "11px 14px",
    border: "1.5px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    background: "#ffffff",
    cursor: "pointer",
    color: "#0f172a",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
  textarea: {
    padding: "11px 14px",
    border: "1.5px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    background: "#ffffff",
    fontFamily: "inherit",
    resize: "vertical",
    color: "#0f172a",
    lineHeight: "1.6",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },

  /* ================= ACCOMPANIED VISITORS ================= */
  accompaniedCard: {
    background: "linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)",
    padding: "18px",
    borderRadius: "12px",
    marginBottom: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
  visitorBadge: {
    display: "inline-block",
    padding: "5px 14px",
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    color: "#ffffff",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "14px",
    letterSpacing: "0.02em",
    boxShadow: "0 2px 4px 0 rgba(37, 99, 235, 0.3)",
  },
  accompaniedFields: {
    display: "flex",
    gap: "14px",
  },

  /* ================= SUBMIT BUTTON ================= */
  submitBtn: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    marginTop: "28px",
    letterSpacing: "0.01em",
    boxShadow:
      "0 4px 6px -1px rgba(37, 99, 235, 0.4), 0 2px 4px -1px rgba(37, 99, 235, 0.3)",
  },

  /* ================= QR SUCCESS SCREEN ================= */
  qrCard: {
    width: "90%",
    maxWidth: "540px",
    margin: "60px auto",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "48px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  successIcon: {
    marginBottom: "24px",
    filter: "drop-shadow(0 4px 6px rgba(16, 185, 129, 0.2))",
  },
  successTitle: {
    margin: "0 0 10px 0",
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  successSubtitle: {
    margin: "0 0 28px 0",
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
  },
  requestIdBox: {
    background: "linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)",
    padding: "18px 20px",
    borderRadius: "12px",
    marginBottom: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    border: "1px solid #e2e8f0",
    boxShadow: "inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
  requestIdLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  requestIdValue: {
    fontSize: "19px",
    color: "#0f172a",
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
  },
  qrBox: {
    background: "linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)",
    padding: "32px",
    borderRadius: "16px",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  },
  qrInstruction: {
    fontSize: "14px",
    color: "#475569",
    margin: "0 0 28px 0",
    lineHeight: "1.6",
    fontWeight: "500",
  },
  downloadBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    letterSpacing: "0.01em",
    boxShadow:
      "0 4px 6px -1px rgba(5, 150, 105, 0.4), 0 2px 4px -1px rgba(5, 150, 105, 0.3)",
  },
  newRequestBtn: {
    width: "100%",
    padding: "14px",
    background: "#ffffff",
    color: "#2563eb",
    border: "2px solid #2563eb",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    letterSpacing: "0.01em",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
};
