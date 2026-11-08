import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { filterProducts } from "../utils/filterProducts";

// Shared header search: load the catalog once, then filter locally as the user types.
// Autocomplete provides the dropdown, arrow-key navigation, Escape, and focus handling.
export default function ProductSearch() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Cancel the request if the header unmounts (also handles React Strict Mode).
    const controller = new AbortController();
    fetch("http://localhost:5001/api/admin/products", { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Unable to load search suggestions");
        return response.json();
      })
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(error => { if (error.name !== "AbortError") setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <Autocomplete
    className="product-search"
    options={products}
    inputValue={query}
    onInputChange={(_, value) => setQuery(value)}
    // Keep the dropdown hidden until there is a non-whitespace search term.
    filterOptions={(options, { inputValue }) => inputValue.trim()
      ? filterProducts(options, { q: inputValue, min: "", max: "" }).slice(0, 8)
      : []}
    getOptionLabel={product => product.title || "Untitled product"}
    getOptionKey={product => product._id}
    isOptionEqualToValue={(option, value) => option._id === value._id}
    value={null}
    loading={loading}
    noOptionsText={failed ? "Search unavailable. Please refresh to try again." : query.trim() ? "No matching products" : "Type to search all products"}
    onChange={(_, product) => {
      if (!product) return;
      // Store the product ID in the URL so details also work after a refresh.
      navigate(`/products?product=${encodeURIComponent(product._id)}`);
      setQuery("");
    }}
    renderOption={(props, product) => {
      const { key, ...optionProps } = props;
      return <li key={key} {...optionProps}>
        <div className="search-suggestion">
          {product.image1 || product.imageUrl ? <img src={product.image1 || product.imageUrl} alt=""/> : <span className="suggestion-placeholder" aria-hidden="true">◇</span>}
          <div><strong>{product.title}</strong><span>{product.category === "laptop" ? "Laptop" : product.category === "mobile" ? "Mobile" : "Accessories"}</span></div>
          <b>₹{Number(product.price || 0).toLocaleString("en-IN")}</b>
        </div>
      </li>;
    }}
    renderInput={params => <TextField {...params} placeholder="Search mobiles, laptops, accessories…" size="small" inputProps={{ ...params.inputProps, "aria-label": "Search all products" }} InputProps={{ ...params.InputProps, endAdornment: <>{loading && <CircularProgress color="inherit" size={16}/>} {params.InputProps.endAdornment}</> }}/>} />;
}
