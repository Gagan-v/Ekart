// Controlled filter form: values live in the parent URL, and each change updates results immediately.
export default function ProductFilters({ filters, onChange, onReset, count, total, categoryLocked }) {
  const update = event => onChange(event.target.name, event.target.type === "checkbox" ? event.target.checked : event.target.value);
  const invalidRange = filters.min !== "" && filters.max !== "" && Number(filters.min) > Number(filters.max);
  return <section className="product-filters" aria-label="Search and filter products">
    <form className="filter-form" role="search" onSubmit={event => event.preventDefault()}>
      <label className="filter-search">Search products<input type="search" name="q" placeholder="Search by name or features…" value={filters.q} onChange={update}/></label>
      <label>Category<select name="category" value={filters.category} onChange={update} disabled={categoryLocked}><option value="">All categories</option><option value="mobile">Mobile phones</option><option value="laptop">Laptops</option><option value="accessories">Accessories</option></select></label>
      <label>Min price (₹)<input type="number" name="min" min="0" step="any" placeholder="0" value={filters.min} onChange={update} aria-invalid={invalidRange} aria-describedby={invalidRange ? "price-error" : undefined}/></label>
      <label>Max price (₹)<input type="number" name="max" min="0" step="any" placeholder="Any price" value={filters.max} onChange={update} aria-invalid={invalidRange} aria-describedby={invalidRange ? "price-error" : undefined}/></label>
      <label>Sort by<select name="sort" value={filters.sort} onChange={update}><option value="">Recommended</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option><option value="name">Name: A–Z</option></select></label>
      <div className="filter-bottom"><label className="stock-filter"><input type="checkbox" name="inStock" checked={filters.inStock} onChange={update}/> In stock only</label><button type="button" onClick={onReset}>Clear filters</button></div>
    </form>
    {invalidRange && <p id="price-error" role="alert" className="text-red-600 text-sm mt-3">Maximum price must be greater than or equal to minimum price.</p>}
    <p className="filter-count" role="status">Showing {count} of {total} product{total === 1 ? "" : "s"}</p>
  </section>;
}
