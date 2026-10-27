import { test } from "node:test";
import assert from "node:assert/strict";
import { filterProducts } from "./filterProducts.js";

const products = [
  { title: "Nova phone", category: "mobile", price: 200, stock: 4, specs: ["OLED", "128 GB"], averageRating: 4 },
  { title: "Nova laptop", category: "laptop", price: 900, stock: 0, specs: ["OLED", "16 GB"], averageRating: 5 },
  { title: "Audio headphones", category: "accessories", price: 50, stock: 2, specs: "Wireless audio" },
];
const defaults = { q: "", category: "", min: "", max: "", sort: "", inStock: false };
const search = filters => filterProducts(products, { ...defaults, ...filters });
test("searches all categories and matches case-insensitive feature terms", () => {
  assert.equal(search({}).length, 3);
  assert.equal(search({ q: " NOVA " }).length, 2);
  assert.equal(search({ q: "nova OLED 128" })[0].category, "mobile");
  assert.equal(search({ q: "wireless" })[0].category, "accessories");
});
test("combines category, inclusive prices, and availability", () => {
  assert.deepEqual(search({ category: "laptop", inStock: true }), []);
  assert.equal(search({ min: "50", max: "200", inStock: true }).length, 2);
  assert.deepEqual(search({ min: "900", max: "50" }), []);
  assert.deepEqual(search({ q: "nonexistent" }), []);
});
test("sorts by price, rating and name without mutating the catalog", () => {
  assert.equal(search({ sort: "price-asc" })[0].price, 50);
  assert.equal(search({ sort: "price-desc" })[0].price, 900);
  assert.equal(search({ sort: "rating" })[0].category, "laptop");
  assert.equal(search({ sort: "name" })[0].title, "Audio headphones");
  assert.equal(products[0].price, 200);
});
test("handles missing optional fields", () => {
  assert.equal(filterProducts([{ price: 0 }], defaults).length, 1);
  assert.deepEqual(filterProducts([{ price: 0 }], { ...defaults, q: "phone" }), []);
});
