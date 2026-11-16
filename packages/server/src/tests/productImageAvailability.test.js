import { test } from "node:test";
import assert from "node:assert/strict";
import { withImageUrl } from "../services/productImages.js";

test("missing image configuration preserves product data and removes stale private URLs", async t => {
  const previous = process.env.AWS_REGION;
  delete process.env.AWS_REGION;
  t.after(() => { if (previous !== undefined) process.env.AWS_REGION = previous; });
  t.mock.method(console, "warn", () => {});
  const product = { toObject: () => ({ title: "Phone", price: 100, stock: 2,
    imageKey: "products/mobile/example.jpg", imageUrl: "https://private.example/expired", image1: "expired" }) };
  const data = await withImageUrl(product);
  assert.equal(data.title, "Phone");
  assert.equal(data.price, 100);
  assert.equal(data.stock, 2);
  assert.deepEqual(data.imageUrls, []);
  assert.equal(data.imageUrl, "");
  assert.equal(data.image1, "");
});

test("products with ordinary non-S3 images retain their existing images", async () => {
  const data = await withImageUrl({ toObject: () => ({ title: "Phone", image1: "/phone.png" }) });
  assert.deepEqual(data.imageUrls, ["/phone.png"]);
});
