import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "20px", background: "#f5f5f5" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;