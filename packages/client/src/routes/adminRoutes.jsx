import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/adminLogin";
import AdminDash from "../pages/adminDash";
import AddProduct from "../components/addproduct";
const AdminRoutes = () => {
  return (
    <div className="">
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDash />} />
        <Route path="/admin/dashboard/add-product" element={<AddProduct />} />
      </Routes>
    </div>
  );
};

export default AdminRoutes;
