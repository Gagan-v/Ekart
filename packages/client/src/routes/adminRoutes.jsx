import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/adminLogin";
import AdminDash from "../pages/adminDash";
import AddProduct from "../components/addproduct";
import ProductMaintenance from "../pages/ProductMaintenance";
const AdminRoutes = () => {
  return (
    <div className="">
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDash />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route
          path="/admin/products-maintenance"
          element={<ProductMaintenance />}
        />
      </Routes>
    </div>
  );
};

export default AdminRoutes;
