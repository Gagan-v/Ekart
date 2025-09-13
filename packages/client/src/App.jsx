import "./App.css";
import Navbar from "./components/NavBar";
import AdminRoutes from "./routes/adminRoutes";
import AppRoutes from "./routes/approutes";

function App() {
  return (
    <>
      <Navbar />
      <AppRoutes />
      {/* adminroute */}
      <AdminRoutes />
    </>
  );
}

export default App;
