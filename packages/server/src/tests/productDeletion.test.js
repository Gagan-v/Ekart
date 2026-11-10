import ImageUpload from "../model/ImageUpload.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import Product from "../model/Product.js";
import { deleteProduct, reduceProductStock } from "../controllers/productController.js";
import { productImageKey, imageReferenceQuery } from "../services/productImages.js";

function response() {
  return {
    code: 200,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function setEnv(t, name, value) {
  const previous = process.env[name];
  process.env[name] = value;
  t.after(() => {
    if (previous === undefined) delete process.env[name];
    else process.env[name] = previous;
  });
}

function setup(t, product, send) {
  setEnv(t, "AWS_REGION", "us-east-2");
  setEnv(t, "AWS_S3_BUCKET", "test-images");
  t.mock.method(Product, "findById", async () => product);
  t.mock.method(ImageUpload, "updateOne", async () => ({}));
  t.mock.method(ImageUpload, "findOneAndUpdate", async () => ({ state: "pending" }));
  t.mock.method(Product, "exists", async () => null);
  t.mock.method(S3Client.prototype, "send", send);
}

test("product deletion waits for S3 before removing the database record", async (t) => {
  const operations = [];
  setup(t, {
    imageKey: "products/mobile/example.jpg",
    async deleteOne() { operations.push("database"); },
  }, async (command) => {
    assert.ok(command instanceof DeleteObjectCommand);
    assert.deepEqual(command.input, { Bucket: "test-images", Key: "products/mobile/example.jpg" });
    operations.push("s3");
    return {};
  });
  const res = response();
  await deleteProduct({ params: { id: "example" } }, res);
  assert.deepEqual(operations, ["s3", "database"]);
  assert.equal(res.code, 200);
  assert.equal(res.body.imageDeleted, true);
});

test("S3 access denial preserves the product and returns an actionable error", async (t) => {
  let removed = false;
  setup(t, {
    imageKey: "products/mobile/example.jpg",
    async deleteOne() { removed = true; },
  }, async () => { throw Object.assign(new Error("denied"), { name: "AccessDenied" }); });
  t.mock.method(console, "error", () => {});
  const res = response();
  await deleteProduct({ params: { id: "example" } }, res);
  assert.equal(removed, false);
  assert.equal(res.code, 500);
  assert.match(res.body.message, /s3:DeleteObject/);
});

test("reducing stock to zero removes the image and reports version retention", async (t) => {
  let removed = false;
  setup(t, {
    stock: 1,
    imageKey: "products/mobile/example.jpg",
    async deleteOne() { removed = true; },
  }, async () => ({ DeleteMarker: true }));
  const res = response();
  await reduceProductStock({ params: { id: "example" }, body: { quantity: 1 } }, res);
  assert.equal(removed, true);
  assert.equal(res.body.deleted, true);
  assert.equal(res.body.imageVersionRetained, true);
});

test("S3 failure when stock reaches zero keeps stock and the database record", async (t) => {
  const product = {
    stock: 1,
    imageKey: "products/mobile/example.jpg",
    async deleteOne() { assert.fail("must keep the product"); },
  };
  setup(t, product, async () => { throw new Error("network unavailable"); });
  t.mock.method(console, "error", () => {});
  const res = response();
  await reduceProductStock({ params: { id: "example" }, body: { quantity: 1 } }, res);
  assert.equal(res.code, 500);
  assert.equal(product.stock, 1);
});

test("products with Base64 images can be deleted without calling S3", async (t) => {
  let removed = false;
  setup(t, {
    imageUrl: "data:image/png;base64,example",
    async deleteOne() { removed = true; },
  }, async () => { assert.fail("must not call S3"); });
  const res = response();
  await deleteProduct({ params: { id: "example" } }, res);
  assert.equal(removed, true);
  assert.equal(res.body.imageDeleted, false);
});

test("legacy image URLs are recovered only from the configured bucket", (t) => {
  setEnv(t, "AWS_REGION", "us-east-2");
  setEnv(t, "AWS_S3_BUCKET", "test-images");
  assert.equal(productImageKey({ imageUrl: "https://test-images.s3.us-east-2.amazonaws.com/products/mobile/example.jpg?old=signature" }), "products/mobile/example.jpg");
  assert.equal(productImageKey({ imageUrl: "https://another-bucket.s3.us-east-2.amazonaws.com/products/mobile/example.jpg" }), "");
});

test("keys outside the product folders cannot delete S3 objects", async (t) => {
  setup(t, {
    imageKey: "other/example.jpg",
    async deleteOne() { assert.fail("must keep the product"); },
  }, async () => { assert.fail("must not call S3"); });
  t.mock.method(console, "error", () => {});
  const res = response();
  await deleteProduct({ params: { id: "example" } }, res);
  assert.equal(res.code, 500);
});


test("deleting a product removes all gallery images exactly once", async (t) => {
  const deleted = [];
  let removed = false;
  setup(t, {
    imageKey: "products/mobile/main.jpg",
    imageKeys: ["products/mobile/main.jpg", "products/mobile/second.png"],
    async deleteOne() { removed = true; },
  }, async (command) => { deleted.push(command.input.Key); return {}; });
  const res = response();
  await deleteProduct({ params: { id: "example" } }, res);
  assert.equal(res.code, 200);
  assert.equal(removed, true);
  assert.deepEqual(deleted, ["products/mobile/main.jpg", "products/mobile/second.png"]);
});


test("cleanup reference matching includes legacy signed URLs only for this bucket", (t) => {
  setEnv(t, "AWS_REGION", "us-east-2");
  setEnv(t, "AWS_S3_BUCKET", "test-images");
  const query = imageReferenceQuery("products/mobile/example.jpg");
  const regex = new RegExp(query.$or[2].imageUrl.$regex);
  assert.equal(regex.test("https://test-images.s3.us-east-2.amazonaws.com/products/mobile/example.jpg?signature=old"), true);
  assert.equal(regex.test("https://test-images.s3.amazonaws.com/products/mobile/example.jpg"), true);
  assert.equal(regex.test("https://other.s3.us-east-2.amazonaws.com/products/mobile/example.jpg"), false);
  assert.equal(regex.test("https://test-images.s3.us-east-2.amazonaws.com/products/mobile/exampleXjpg"), false);
});
