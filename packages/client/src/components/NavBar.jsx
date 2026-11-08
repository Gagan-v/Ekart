import ProductSearch from "./ProductSearch";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Badge, IconButton, Menu, MenuItem, ListItemText } from "@mui/material";

// SVG Icon Components
const AccountCircleIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Load cart items count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        let cartItems;
        try { cartItems = JSON.parse(savedCart); } catch { cartItems = []; }
        if (!Array.isArray(cartItems)) cartItems = [];
        const totalItems = cartItems.reduce(
          (sum, item) => sum + (Number(item?.quantity) || 0),
          0
        );
        setCartItemCount(totalItems);
      } else {
        setCartItemCount(0);
      }
    };

    // Update cart count on component mount
    updateCartCount();

    // Listen for storage changes (when cart is updated from other components)
    window.addEventListener("storage", updateCartCount);

    // Custom event for same-tab cart updates
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const updateAuthState = () => {
      const user = localStorage.getItem("authUser");
      if (user) {
        try {
          const parsed = JSON.parse(user);
          setUserName(parsed.name || parsed.email || "User");
          setIsLoggedIn(true);
        } catch {
          setIsLoggedIn(false);
          setUserName("");
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    // Initial load
    updateAuthState();

    // Listen for storage changes from other tabs
    const onStorage = () => {
      updateAuthState();
    };

    // Listen for custom auth state changes from same tab
    const onAuthStateChanged = (event) => {
      if (event.detail.isLoggedIn) {
        setUserName(
          event.detail.user.name || event.detail.user.email || "User"
        );
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("authStateChanged", onAuthStateChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authStateChanged", onAuthStateChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    // Keep cart in DB, but clear local copy when logging out
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));

    // Dispatch custom event to notify navbar of logout state change
    window.dispatchEvent(
      new CustomEvent("authStateChanged", {
        detail: { isLoggedIn: false, user: null },
      })
    );

    setIsLoggedIn(false);
    setUserName("");
    setAnchorEl(null); // Close dropdown
    navigate("/");
  };

  // Dropdown menu handlers
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAccountClick = () => {
    navigate("/account");
    handleMenuClose();
  };

  return <header className="store-header">
    <div className="header-main">
      <Link className="brand" to="/">e<span>kart.</span></Link>
      <ProductSearch />
      <div className="header-actions">
        <IconButton component={Link} to="/cart" aria-label={`Shopping cart, ${cartItemCount} items`}><Badge badgeContent={cartItemCount} color="primary"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 3h2l3 12h11l2-8H6M9 20h.01M18 20h.01" strokeLinecap="round" strokeLinejoin="round"/></svg></Badge></IconButton>
        {isLoggedIn ? <><IconButton onClick={handleProfileClick} aria-label="Account menu" aria-haspopup="menu" aria-expanded={Boolean(anchorEl)}><AccountCircleIcon /></IconButton><Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}><MenuItem disabled><ListItemText primary={userName} /></MenuItem><MenuItem onClick={handleAccountClick}>My account</MenuItem><MenuItem onClick={handleLogout}>Sign out</MenuItem></Menu></> : <Link className="sign-in" to="/login">Sign in <span aria-hidden="true">↗</span></Link>}
      </div>
    </div>
    <nav className="category-nav" aria-label="Shop categories"><NavLink to="/" end>Discover</NavLink><NavLink to="/products">All products</NavLink><NavLink to="/mobile">Mobile phones</NavLink><NavLink to="/laptop">Laptops</NavLink><NavLink to="/accessories">Accessories</NavLink><span>Find your next favorite.</span></nav>
  </header>;
}
