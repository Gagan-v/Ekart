import "./App.css";
import Navbar from "./components/NavBar";
import AdminRoutes from "./routes/adminRoutes";
import AppRoutes from "./routes/approutes";
// import { useLocation } from "react-router-dom";

function App() {
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdminRoute && (
        // && - means true
        <>
          <Navbar />
          <AppRoutes />
        </>
      )}
      {/* adminroute */}
      {isAdminRoute && <AdminRoutes />}
    </>
  );
}

export default App;
