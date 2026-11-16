import { apiFetch } from "../api/config";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditProductDialog from "../components/EditProductDialog";
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

const ProductMaintenance = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [warning, setWarning] = useState("");
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
        const res = await apiFetch("/api/admin/products", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not load products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Could not load products. Check that the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [adminToken, navigate]);

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError("");
    setNotice("");
    try {
      const res = await apiFetch(
        `/api/admin/products/${deleteTarget._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not delete product");
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
      setNotice(data.imageVersionRetained
        ? "Product and current image deleted. S3 bucket versioning retains older image versions."
        : data.imageDeleted
          ? "Product and S3 image deleted."
          : "Product deleted. This record had no associated S3 image key.");
    } catch (err) {
      setError(err.message || "Could not delete product. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

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
      const res = await apiFetch(
        `/api/admin/products/${product._id}/reduce`,
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
          setNotice(data.imageVersionRetained
            ? "Product deleted. S3 bucket versioning retains older image versions."
            : "Product deleted because stock reached zero.");
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
      setError("Could not reduce stock. Check that the backend is running.");
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      {warning && <Alert severity="warning" sx={{ mb: 2 }}>{warning}</Alert>}

      <EditProductDialog
        product={editTarget}
        adminToken={adminToken}
        onClose={() => setEditTarget(null)}
        onSaved={(updated, cleanupWarning) => {
          setProducts((prev) => prev.map((p) => p._id === updated._id ? updated : p));
          setEditTarget(null);
          setError("");
          setNotice("Product updated.");
          setWarning(cleanupWarning || "");
        }}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => {
        if (!deleting) setDeleteTarget(null);
      }}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete “{deleteTarget?.title}” and its associated S3 image? This cannot be undone.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

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
                      disabled={deleting}
                      sx={{ mr: 1 }}
                      onClick={() => {
                        setError("");
                        setNotice("");
                        setWarning("");
                        setEditTarget(p);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleReduce(p)}
                    >
                      Reduce stock
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={deleting}
                      sx={{ ml: 1 }}
                      onClick={() => {
                        setError("");
                        setDeleteTarget(p);
                      }}
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
