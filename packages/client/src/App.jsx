import "./App.css";
import Navbar from "./components/NavBar";
import AdminRoutes from "./routes/adminRoutes";
import AppRoutes from "./routes/approutes";
// import { useLocation } from "react-router-dom";

function App() {
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {!isAdminRoute && (
        // && - means true
        <>
          <Navbar />
          <div style={{ flex: 1, padding: "0 2rem", paddingTop: "64px" }}>
            <AppRoutes />
          </div>
        </>
      )}
      {/* adminroute */}
      {isAdminRoute && <AdminRoutes />}
    </div>
  );
}

export default App;
