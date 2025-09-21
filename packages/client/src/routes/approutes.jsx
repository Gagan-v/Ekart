import { Route, Routes } from "react-router-dom";
import Home from "../pages/home";
import Mobile from "../pages/mobile";
import Laptops from "../pages/laptops";
import Accessories from "../pages/accessories";
// Removed unused imports: Kitchen, Dining, Room (old Home Appliances pages)

const AppRoutes = () => {
  return (
    <div className="approutes">
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add more pages here */}
        {/* Simplified routes - direct category navigation */}
        <Route path="/mobile" element={<Mobile />} />
        <Route path="/laptop" element={<Laptops />} />
        <Route path="/accessories" element={<Accessories />} />
        {/* Removed old nested routes for Electronics and Home Appliances */}
      </Routes>
    </div>
  );
};

export default AppRoutes;
