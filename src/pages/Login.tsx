/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "visitor" | "host";

interface UserForm {
  name: string;
  email: string;
}

const DEMO_CREDENTIALS = {
  visitor: {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
  },
  host: {
    name: "Amit Verma",
    email: "amit.verma@company.com",
  },
};

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("visitor");
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
  });

  const handleLogin = () => {
    if (!form.name || !form.email) {
      alert("Please fill all fields");
      return;
    }

    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(form));

    role === "host" ? navigate("/host") : navigate("/visitor/home");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🏢</div>
          <h1 style={styles.heading}>Visitor Management System</h1>
          <p style={styles.subheading}>Secure access for visitors and hosts</p>
        </div>

        {/* Form */}
        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Login As</label>
            <select
              style={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="visitor">Visitor</option>
              <option value="host">Host</option>
            </select>
          </div>

          <button style={styles.button} onClick={handleLogin}>
            Continue
          </button>
          {/* Demo Credentials */}
          <div style={styles.demoBox}>
            <h4 style={styles.demoTitle}>Demo Credentials</h4>

            <div style={styles.demoRow}>
              <span style={styles.demoRole}>
                {role === "visitor" ? "Visitor" : "Host"}
              </span>

              <div style={styles.demoText}>
                <div>{DEMO_CREDENTIALS[role].name}</div>
                <div style={styles.demoEmail}>
                  {DEMO_CREDENTIALS[role].email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>© 2026 Visitor Management System</div>
      </div>
    </div>
  );
};

export default Login;

/* ====================== STYLES ====================== */

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #c2d1f5 0%, #e5efff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    width: "420px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "36px",
    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.25)",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    textAlign: "center",
    marginBottom: "28px",
  },

  logo: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    margin: "0 auto 14px",
    color: "#fff",
  },

  heading: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#0f172a",
  },

  subheading: {
    marginTop: "6px",
    fontSize: "14px",
    color: "#64748b",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  },

  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },

  select: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    cursor: "pointer",
  },

  button: {
    marginTop: "10px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },

  footer: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "12px",
    color: "#94a3b8",
  },
  demoBox: {
    marginTop: "20px",
    padding: "14px",
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px dashed #cbd5e1",
  },

  demoTitle: {
    margin: "0 0 10px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  demoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  },

  demoRole: {
    minWidth: "60px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#2563eb",
  },

  demoText: {
    fontSize: "13px",
    color: "#334155",
  },

  demoEmail: {
    fontSize: "12px",
    color: "#64748b",
  },

  divider: {
    height: "1px",
    background: "#e2e8f0",
    margin: "8px 0",
  },
};
