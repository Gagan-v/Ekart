import { Route, Routes } from "react-router-dom";
import Home from "../pages/home";
import Mobile from "../pages/mobile";
import Laptops from "../pages/laptops";
import Accessories from "../pages/accessories";
import Kitchen from "../pages/kitchen";
import Dining from "../pages/dining";
import Room from "../pages/room";

const AppRoutes = () => {
  return (
    <div className="approutes">
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add more pages here */}
        <Route path="/electronics/mobiles" element={<Mobile />} />
        <Route path="/electronics/laptops" element={<Laptops />} />
        <Route path="/electronics/accessories" element={<Accessories />} />
        <Route path="/home/kitchen" element={<Kitchen />} />
        <Route path="/home/dining-hall" element={<Dining />} />
        <Route path="/home/living-room" element={<Room />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
