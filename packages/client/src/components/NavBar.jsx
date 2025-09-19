import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { useState } from "react";

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

const Arrow = styled("span", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ open }) => ({
  display: "inline-block",
  marginLeft: 6,
  border: "solid white",
  borderWidth: "0 2px 2px 0",
  padding: 3,
  transition: "transform 120ms ease",
  transform: open ? "rotate(45deg)" : "rotate(-135deg)",
}));

export default function Navbar() {
  const isLoggedIn = false; // TODO: auth logic
  const userName = "Gagan";

  // Keep track of which menu is open (ensures only one opens at a time)
  const [openMenu, setOpenMenu] = useState(null); // 'electronics' | 'home' | null
  const [anchorElElectronics, setAnchorElElectronics] = useState(null);
  const [anchorElHome, setAnchorElHome] = useState(null);

  const openElectronics = openMenu === "electronics";
  const openHome = openMenu === "home";

  const openElectronicsMenu = (event) => {
    setAnchorElElectronics(event.currentTarget);
    setOpenMenu("electronics");
    setAnchorElHome(null);
  };

  const openHomeMenu = (event) => {
    setAnchorElHome(event.currentTarget);
    setOpenMenu("home");
    setAnchorElElectronics(null);
  };

  const closeAllMenus = () => {
    setOpenMenu(null);
    setAnchorElElectronics(null);
    setAnchorElHome(null);
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

          {/* Electronics (hover to open, stays open while hovering menu) */}
          <Box onMouseEnter={openElectronicsMenu}>
            <Button
              sx={{ color: "white" }}
              endIcon={<Arrow open={openElectronics} />}
            >
              Electronics
            </Button>
          </Box>
          <Menu
            anchorEl={anchorElElectronics}
            open={openElectronics}
            onClose={closeAllMenus}
            disableScrollLock
            PaperProps={{
              onMouseEnter: () => setOpenMenu("electronics"),
              onMouseLeave: closeAllMenus,
              sx: { mt: 1 },
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem
              component={Link}
              to="/electronics/mobiles"
              onClick={closeAllMenus}
            >
              Mobiles
            </MenuItem>
            <MenuItem
              component={Link}
              to="/electronics/laptops"
              onClick={closeAllMenus}
            >
              Laptops
            </MenuItem>
            <MenuItem
              component={Link}
              to="/electronics/accessories"
              onClick={closeAllMenus}
            >
              Accessories
            </MenuItem>
          </Menu>

          {/* Home Appliances */}
          <Box onMouseEnter={openHomeMenu}>
            <Button sx={{ color: "white" }} endIcon={<Arrow open={openHome} />}>
              Home Appliances
            </Button>
          </Box>
          <Menu
            anchorEl={anchorElHome}
            open={openHome}
            onClose={closeAllMenus}
            disableScrollLock
            PaperProps={{
              onMouseEnter: () => setOpenMenu("home"),
              onMouseLeave: closeAllMenus,
              sx: { mt: 1 },
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem
              component={Link}
              to="/home/kitchen"
              onClick={closeAllMenus}
            >
              Kitchen
            </MenuItem>
            <MenuItem
              component={Link}
              to="/home/dining-hall"
              onClick={closeAllMenus}
            >
              Dining Hall
            </MenuItem>
            <MenuItem
              component={Link}
              to="/home/living-room"
              onClick={closeAllMenus}
            >
              Living Room Sofas
            </MenuItem>
          </Menu>
        </Box>

        {/* Right: Profile/Login */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {isLoggedIn ? (
            <Avatar>{userName[0]}</Avatar>
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
