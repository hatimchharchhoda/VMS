import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <div style={{ width: "250px", background: "#111827", color: "white", padding: "20px" }}>
      <h2>Admin Panel</h2>

      <nav style={{ marginTop: "30px" }}>
        <NavLink to="/admin/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/admin/visitors" style={linkStyle}>Visitors</NavLink>
        <NavLink to="/admin/locations" style={linkStyle}>Locations</NavLink>
      </nav>
    </div>
  );
};

const linkStyle = ({ isActive }) => ({
  display: "block",
  margin: "10px 0",
  color: isActive ? "white" : "#cbd5e1",
  textDecoration: "none",
});

export default AdminSidebar;