import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/adminLogin";
import AdminDash from "../pages/adminDash";
const AdminRoutes = () => {
  return (
    <div className="">
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDash />} />
      </Routes>
    </div>
  );
};

export default AdminRoutes;
