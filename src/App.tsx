import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import VisitorHome from "./pages/Visitor/Home";
import Dashboard from "./pages/Admin/Dashboard";
import VisitorRegistration from "./pages/Visitor/Registration";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/visitor/home" element={<VisitorHome />} />
        <Route path="/visitor/register" element={<VisitorRegistration />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;