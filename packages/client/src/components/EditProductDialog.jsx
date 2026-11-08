import MobileImagePicker from "./MobileImagePicker";
import { uploadMobileImages } from "../utils/uploadMobileImages";
import { useEffect, useState, useRef } from "react";
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField,
} from "@mui/material";

export default function EditProductDialog({ product, adminToken, onClose, onSaved }) {
  const [form, setForm] = useState({ title: "", price: "", stock: "", specs: "" });
  const [images, setImages] = useState([]);
  const [imagesChanged, setImagesChanged] = useState(false);
  const uploadCache = useRef(new Map());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!product) return;
    setForm({
      title: product.title,
      price: String(product.price),
      stock: String(product.stock),
      specs: (product.specs || []).join("\n"),
    });
    const keys = product.imageKeys?.length ? product.imageKeys : product.imageKey ? [product.imageKey] : [];
    setImages(keys.map((key, index) => ({ key, url: product.imageUrls?.[index] || product.imageUrl })));
    setImagesChanged(false);
    uploadCache.current.clear();
    setError("");
  }, [product]);

  const change = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    if (saving || !product) return;
    if (!form.title.trim() || form.price.trim() === "" || form.stock.trim() === "" ||
        !Number.isFinite(Number(form.price)) || Number(form.price) < 0 ||
        !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError("Enter a title, a non-negative price, and a whole stock quantity of zero or more.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (imagesChanged && product.category === "mobile") {
        body.imageKeys = await uploadMobileImages(images, adminToken, uploadCache.current);
      }
      const response = await fetch(`http://localhost:5001/api/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save product");
      onSaved(data.product, data.warning);
    } catch (err) {
      setError(err.message || "Could not save product. Check your connection and retry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(product)} onClose={() => { if (!saving) onClose(); }} fullWidth maxWidth="sm">
      <form onSubmit={save}>
        <DialogTitle>Edit product</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Title" name="title" value={form.title} onChange={change} disabled={saving} required />
            <TextField label="Price" name="price" type="number" value={form.price} onChange={change} disabled={saving} required slotProps={{ htmlInput: { min: 0, step: "any" } }} />
            <TextField label="Stock" name="stock" type="number" value={form.stock} onChange={change} disabled={saving} required slotProps={{ htmlInput: { min: 0, step: 1 } }} />
            <TextField label="Specifications (one per line)" name="specs" value={form.specs} onChange={change} disabled={saving} multiline rows={4} />
            {product?.category === "mobile" ? (
              <MobileImagePicker images={images} onChange={(next) => { setImages(next); setImagesChanged(true); }} disabled={saving} />
            ) : product?.imageUrl && <img src={product.imageUrl} alt={product.title} style={{ maxWidth: "100%", height: 160, objectFit: "contain" }} />}

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
