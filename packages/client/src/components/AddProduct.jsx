import { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const AddProduct = () => {
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [specs, setSpecs] = useState("•");
  const [image, setImage] = useState(null); // for file

  const handleSubmit = (e) => {
    e.preventDefault();

    // For now just log
    console.log({
      category,
      subCategory,
      title,
      price,
      specs,
      image,
    });

    // Later: send this to backend
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSpecs((prev) => prev + "\n• ");
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 500, margin: "20px auto" }}
    >
      {/* Category */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <MenuItem value="electronics">Electronics</MenuItem>
          <MenuItem value="home-appliances">Home Appliances</MenuItem>
        </Select>
      </FormControl>

      {/* Subcategory (depends on category) */}
      {category === "electronics" && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Subcategory</InputLabel>
          <Select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          >
            <MenuItem value="mobile">Mobile</MenuItem>
            <MenuItem value="laptop">Laptop</MenuItem>
          </Select>
        </FormControl>
      )}

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

      <Button type="submit" variant="contained" color="primary">
        Add Product
      </Button>
    </form>
  );
};

export default AddProduct;
