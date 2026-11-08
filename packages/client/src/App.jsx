import "./App.css";
import Navbar from "./components/NavBar";
import AdminRoutes from "./routes/adminRoutes";
import AppRoutes from "./routes/approutes";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    {isAdmin ? <header className="admin-header"><Link className="brand" to="/">e<span>kart.</span></Link><span>Store management</span></header> : <Navbar />}
    <main id="main-content" className={isAdmin ? "admin-content" : "main-content"}>{isAdmin ? <AdminRoutes /> : <AppRoutes />}</main>
    <footer className="site-footer"><Link className="brand" to="/">e<span>kart.</span></Link><p>A little upgrade. A better everyday.</p><div><Link to="/mobile">Shop mobile</Link><Link to="/laptop">Shop laptops</Link><Link to="/accessories">Accessories</Link></div><small>© {new Date().getFullYear()} Ekart</small></footer>
  </div>;
}
