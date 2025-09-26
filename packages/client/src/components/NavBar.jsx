import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Button,
  Avatar,
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

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

const LogoutIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
  >
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
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
        const cartItems = JSON.parse(savedCart);
        const totalItems = cartItems.reduce(
          (sum, item) => sum + item.quantity,
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

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#1976d2", zIndex: 1300 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left: Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: "none", color: "white", fontWeight: "bold" }}
        >
          E-Kart
        </Typography>

        {/* Center: Search Bar + Categories */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Search>
            <SearchInput
              placeholder="Search products..."
              inputProps={{ "aria-label": "search" }}
            />
          </Search>

          {/* Simplified Category Links - Direct navigation to main categories */}
          {/* These three buttons replace the previous dropdown menus for Electronics and Home Appliances */}
          <Button
            component={Link}
            to="/mobile"
            sx={{ color: "white", textTransform: "none", fontSize: "16px" }}
          >
            Mobile
          </Button>
          <Button
            component={Link}
            to="/laptop"
            sx={{ color: "white", textTransform: "none", fontSize: "16px" }}
          >
            Laptop
          </Button>
          <Button
            component={Link}
            to="/accessories"
            sx={{ color: "white", textTransform: "none", fontSize: "16px" }}
          >
            Accessories
          </Button>
        </Box>

        {/* Right: Cart and Profile/Login */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Cart Icon */}
          <IconButton
            component={Link}
            to="/cart"
            sx={{ color: "white" }}
            aria-label="shopping cart"
          >
            <Badge badgeContent={cartItemCount} color="error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24"
                height="24"
                aria-hidden="true"
              >
                <path d="M7 18c-1.104 0-1.99.896-1.99 2S5.896 22 7 22s2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-1.99.896-1.99 2S15.896 22 17 22s2-.896 2-2-.896-2-2-2zM7.334 14h9.9c.86 0 1.617-.55 1.887-1.366l2.46-7.378A1 1 0 0019.64 4H6.21l-.31-1.243A1.998 1.998 0 004 1H2a1 1 0 000 2h1.61l2.54 10.162A2 2 0 008.09 15h9.144a1 1 0 100-2H7.334z" />
              </svg>
            </Badge>
          </IconButton>

          {/* Profile/Login */}
          {isLoggedIn ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={handleProfileClick}
                sx={{ color: "white" }}
                aria-label="account menu"
              >
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem disabled>
                  <ListItemText primary={userName} secondary="Logged in" />
                </MenuItem>
                <MenuItem onClick={handleAccountClick}>
                  <ListItemIcon>
                    <AccountCircleIcon size={20} />
                  </ListItemIcon>
                  <ListItemText>Account Settings</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon size={20} />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="secondary"
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
