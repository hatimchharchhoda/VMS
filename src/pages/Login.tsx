import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "visitor" | "admin";

interface UserForm {
  name: string;
  email: string;
}

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("visitor");
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
  });

  const handleLogin = () => {
    if (!form.name || !form.email) {
      alert("Fill all fields");
      return;
    }

    // fake login
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(form));

    navigate("/home");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Visitor Management System</h2>

        <input
          style={styles.input}
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <select
          style={styles.select}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value="visitor">Visitor</option>
          <option value="admin">Admin</option>
        </select>

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
  },

  card: {
    width: "360px",
    background: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  title: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: "8px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },

  select: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
  },

  button: {
    marginTop: "8px",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
  },
};
