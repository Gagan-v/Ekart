import { Route, Routes } from "react-router-dom";
import Home from "../pages/home";

const AppRoutes = () => {
  return (
    <div className="approutes">
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add more pages here */}
      </Routes>
    </div>
  );
};

export default AppRoutes;
