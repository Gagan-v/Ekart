import { useNavigate } from "react-router-dom";
import { Button, Stack, Typography, Container } from "@mui/material";

const AdminDash = () => {
  const navigate = useNavigate();

  // Logout → takes to /admin/login
  const handleLogout = () => {
    // later we’ll also clear token/session
    navigate("/admin/login");
  };

  // Add Product → takes to /admin/add-product
  const handleAddProduct = () => {
    navigate("/admin/add-product");
  };
  return (
    <div className="">
      <Container sx={{ mt: 4 }}>
        {/* Heading */}
        <Typography variant="h4" gutterBottom>
          Welcome to Admin Dashboard
        </Typography>

        {/* Buttons in a row */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={handleAddProduct}
          >
            Add Product
          </Button>

          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Container>
    </div>
  );
};

export default AdminDash;
