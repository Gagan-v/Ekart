import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Button,
  Avatar,
  Box,
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

// Removed Arrow component - no longer needed for dropdown menus

export default function Navbar() {
  const isLoggedIn = false; // TODO: auth logic
  const userName = "Gagan";

  // Removed dropdown menu state - now using direct navigation links

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
