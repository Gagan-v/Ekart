// Pure filtering helper shared by the catalog and live search dropdown.
// Every search word must match the title, category, or specifications (case-insensitive).
export function filterProducts(products, filters) {
  const terms = (filters.q || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const min = filters.min === "" ? 0 : Number(filters.min);
  const max = filters.max === "" ? Infinity : Number(filters.max);
  const result = products.filter(product => {
    const text = [product.title, product.category, ...(Array.isArray(product.specs) ? product.specs : [product.specs])].filter(Boolean).join(" ").toLowerCase();
    return terms.every(term => text.includes(term)) &&
      (!filters.category || product.category === filters.category) &&
      Number(product.price) >= min && Number(product.price) <= max &&
      (!filters.inStock || Number(product.stock) > 0);
  });
  switch (filters.sort) {
    case "price-asc": return result.sort((a, b) => Number(a.price) - Number(b.price));
    case "price-desc": return result.sort((a, b) => Number(b.price) - Number(a.price));
    case "rating": return result.sort((a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0));
    case "name": return result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    default: return result;
  }
}
