import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
} from "@mui/material";

const ProductMaintenance = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  // removed deleted count per new requirements

  const adminToken = useMemo(() => localStorage.getItem("adminToken"), []);

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/admin/products", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await res.json();
        if (res.ok) setProducts(Array.isArray(data) ? data : []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [adminToken, navigate]);

  const handleReduce = async (product) => {
    const input = window.prompt(
      `Reduce stock for "${product.title}" (current: ${product.stock}). Enter quantity:`
    );
    if (input == null) return; // cancelled
    const quantity = Number(input);
    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > product.stock
    ) {
      alert("Please enter a valid quantity (1 - " + product.stock + ")");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/products/${product._id}/reduce`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ quantity }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        if (data.deleted) {
          setProducts((prev) => prev.filter((p) => p._id !== product._id));
        } else {
          setProducts((prev) =>
            prev.map((p) =>
              p._id === product._id ? { ...p, stock: data.stock } : p
            )
          );
        }
      } else if (data?.message) {
        alert(data.message);
      }
    } catch {
      // ignore
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <div>
          <Typography variant="h5">Products Maintenance</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/add-product")}
          >
            Add Product
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subcategory</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No products found.</TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.subCategory}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleReduce(p)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProductMaintenance;
