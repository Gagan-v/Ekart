import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Snackbar,
} from "@mui/material";

const AddProduct = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  // Removed subCategory state - now using only main categories
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [specs, setSpecs] = useState("•");
  const [image, setImage] = useState(null); // for file
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Check if admin is logged in
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin/login");
    }
    const fetchCount = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products/count", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await res.json();
        if (res.ok) setTotalCount(data.count || 0);
      } catch (error) {
        console.error("Error refreshing count:", error);
      }
    };
    fetchCount();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // Function to convert image to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to reset form
  const resetForm = () => {
    setCategory("");
    setTitle("");
    setPrice("");
    setStock("");
    setSpecs("•");
    setImage(null);
  };

  // Function to show message
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setShowSnackbar(true);
  };

  // Function to validate form
  const validateForm = () => {
    if (!category) {
      showMessage("error", "Please select a category");
      return false;
    }
    if (!title.trim()) {
      showMessage("error", "Please enter a product title");
      return false;
    }
    if (!price || price <= 0) {
      showMessage("error", "Please enter a valid price");
      return false;
    }
    if (!stock || Number(stock) < 0 || !Number.isInteger(Number(stock))) {
      showMessage("error", "Please enter a valid stock (integer >= 0)");
      return false;
    }
    if (!specs.trim() || specs.trim() === "•") {
      showMessage("error", "Please enter product specifications");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64 if provided
      let imageUrl = "";
      if (image) {
        imageUrl = await convertImageToBase64(image);
      }

      // Prepare the request body - now using only main category
      const productData = {
        category,
        title: title.trim(),
        price: Number(price),
        stock: Number(stock),
        specs: specs.trim(),
        imageUrl,
      };

      // Get admin token from localStorage
      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        showMessage("error", "Please login as admin first");
        return;
      }

      // Make API call
      const response = await fetch(
        "http://localhost:5000/api/admin/products/add-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showMessage("success", "Product added successfully!");
        resetForm();
        // refresh count
        try {
          const res2 = await fetch("http://localhost:5000/api/products/count", {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          const d2 = await res2.json();
          if (res2.ok) setTotalCount(d2.count || 0);
        } catch (error) {
          console.error("Error refreshing count:", error);
        }
      } else {
        showMessage("error", data.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      showMessage("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSpecs((prev) => prev + "\n• ");
    }
  };
  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: "20px" }}>
      {/* Header with navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Add New Product</h2>
          <div style={{ marginTop: "4px", color: "#555", fontSize: 14 }}>
            Total products: {totalCount}
          </div>
        </div>
        <div>
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/dashboard")}
            style={{ marginRight: "10px" }}
          >
            Dashboard
          </Button>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Simplified Category Dropdown - Only main categories */}
        {/* This replaces the previous two-dropdown system (category + subcategory) */}
        {/* Now admins select directly from: Mobile, Laptop, or Accessories */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="mobile">Mobile</MenuItem>
            <MenuItem value="laptop">Laptop</MenuItem>
            <MenuItem value="accessories">Accessories</MenuItem>
          </Select>
        </FormControl>

        {/* Title */}
        <TextField
          fullWidth
          margin="normal"
          label="Product Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Price */}
        <TextField
          fullWidth
          margin="normal"
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* Stock */}
        <TextField
          fullWidth
          margin="normal"
          label="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        {/* Specs */}
        <TextField
          fullWidth
          margin="normal"
          label="Specifications"
          multiline
          rows={4}
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter product specs..."
        />

        {/* Image Upload (temporary - later connect to S3) */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ margin: "20px 0" }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          style={{ marginTop: "20px" }}
        >
          {loading ? "Adding Product..." : "Add Product"}
        </Button>
      </form>

      {/* Success/Error Message Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={message.type}
          sx={{ width: "100%" }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddProduct;
