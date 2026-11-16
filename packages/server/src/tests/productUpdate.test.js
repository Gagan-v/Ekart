import ImageUpload from "../model/ImageUpload.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import Product from "../model/Product.js";
import { updateProduct, createProduct } from "../controllers/productController.js";

const oldKey = "products/mobile/11111111-1111-4111-8111-111111111111.jpg";
const newKey = "products/mobile/22222222-2222-4222-8222-222222222222.png";

function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

function setup(t, send = async () => ({})) {
  const settings = {
    AWS_REGION: "us-east-2", AWS_S3_BUCKET: "test-images",
    AWS_ACCESS_KEY_ID: "test", AWS_SECRET_ACCESS_KEY: "test",
  };
  for (const [name, value] of Object.entries(settings)) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    });
  }
  const product = {
    _id: "example", category: "mobile", title: "Phone", price: 10, stock: 2,
    specs: ["Old specs"], imageKey: oldKey, imageUrl: "",
    toObject() {
      const { _id, category, title, price, stock, specs, imageKey, imageKeys, imageUrl } = this;
      return { _id, category, title, price, stock, specs, imageKey, imageKeys, imageUrl };
    },
    async save() {},
  };
  t.mock.method(Product, "findById", async () => product);
  t.mock.method(ImageUpload, "updateOne", async () => ({}));
  t.mock.method(ImageUpload, "findOneAndUpdate", async () => ({ state: "pending" }));
  t.mock.method(Product, "exists", async () => null);
  t.mock.method(S3Client.prototype, "send", send);
  t.mock.method(console, "error", () => {});
  return product;
}

test("editing details keeps the image and ignores fields outside the edit form", async (t) => {
  const product = setup(t, async () => { assert.fail("must not mutate S3"); });
  const res = response();
  await updateProduct({ params: { id: "example" }, body: {
    title: " Updated phone ", price: "20.50", stock: 0, specs: "• New specs\n More specs",
    category: "laptop", averageRating: 5, imageUrl: "untrusted",
  } }, res);
  assert.equal(res.code, 200);
  assert.equal(product.title, "Updated phone");
  assert.equal(product.price, 20.5);
  assert.equal(product.stock, 0);
  assert.equal(product.category, "mobile");
  assert.equal(product.imageKey, oldKey);
  assert.equal(product.imageUrl, "");
  assert.deepEqual(product.specs, ["New specs", "More specs"]);
});

test("replacement saves the new image before deleting the old image", async (t) => {
  const events = [];
  const product = setup(t, async (command) => {
    if (command instanceof HeadObjectCommand) {
      assert.equal(command.input.Key, newKey);
      events.push("verify");
      return { ContentType: "image/png" };
    }
    assert.ok(command instanceof DeleteObjectCommand);
    assert.equal(command.input.Key, oldKey);
    events.push("delete old");
    return {};
  });
  product.save = async () => { events.push("save"); };
  const res = response();
  await updateProduct({ params: { id: "example" }, body: { imageKey: newKey } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.product.imageKey, newKey);
  assert.match(res.body.product.imageUrl, /^https:\/\//);
  assert.deepEqual(events, ["verify", "save", "delete old"]);
});

test("a failed database save never deletes the existing image", async (t) => {
  const product = setup(t, async (command) => {
    assert.ok(command instanceof HeadObjectCommand);
    return { ContentType: "image/png" };
  });
  product.save = async () => { throw new Error("DB unavailable"); };
  const res = response();
  await updateProduct({ params: { id: "example" }, body: { imageKey: newKey } }, res);
  assert.equal(res.code, 500);
});

test("missing replacement leaves the current product untouched", async (t) => {
  const product = setup(t, async () => { throw new Error("Not found"); });
  product.save = async () => { assert.fail("must not save"); };
  const res = response();
  await updateProduct({ params: { id: "example" }, body: { imageKey: newKey } }, res);
  assert.equal(res.code, 400);
  assert.equal(product.imageKey, oldKey);
});

test("cleanup failure reports a warning after a successful save", async (t) => {
  const product = setup(t, async (command) => {
    if (command instanceof HeadObjectCommand) return { ContentType: "image/png" };
    throw new Error("S3 unavailable");
  });
  const res = response();
  await updateProduct({ params: { id: "example" }, body: { imageKey: newKey } }, res);
  assert.equal(res.code, 200);
  assert.equal(product.imageKey, newKey);
  assert.match(res.body.warning, /removed images/);
});

test("invalid details are rejected before any save or S3 request", async (t) => {
  const product = setup(t, async () => { assert.fail("must not call S3"); });
  product.save = async () => { assert.fail("must not save"); };
  for (const body of [{ title: " " }, { price: null }, { price: "" }, { price: -1 }, { stock: 1.5 }, { stock: -1 }, { specs: [4] }, { imageKey: "products/laptop/example.jpg" }]) {
    const res = response();
    await updateProduct({ params: { id: "example" }, body }, res);
    assert.equal(res.code, 400, JSON.stringify(body));
  }
});

test("missing product returns 404", async (t) => {
  setup(t);
  t.mock.method(Product, "findById", async () => null);
  const res = response();
  await updateProduct({ params: { id: "missing" }, body: { title: "New title" } }, res);
  assert.equal(res.code, 404);
});


test("gallery edits retain selected images and delete only removed images after saving", async (t) => {
  const events = [];
  const product = setup(t, async (command) => {
    assert.ok(command instanceof DeleteObjectCommand);
    assert.equal(command.input.Key, oldKey);
    events.push("delete");
    return {};
  });
  product.imageKeys = [oldKey, newKey];
  product.save = async () => { events.push("save"); };
  const res = response();
  await updateProduct({ params: { id: "example" }, body: { imageKeys: [newKey] } }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(events, ["save", "delete"]);
  assert.deepEqual(res.body.product.imageKeys, [newKey]);
  assert.equal(res.body.product.imageUrls.length, 1);
  assert.equal(product.imageKey, newKey);
});

test("removing all gallery images clears the main image and deletes every old image", async (t) => {
  const deleted = [];
  const product = setup(t, async (command) => { deleted.push(command.input.Key); return {}; });
  product.imageKeys = [oldKey, newKey];
  const res = response();
  await updateProduct({ params: { id: "example" }, body: { imageKeys: [] } }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(deleted, [oldKey, newKey]);
  assert.deepEqual(res.body.product.imageUrls, []);
  assert.equal(product.imageKey, "");
});

test("duplicate gallery images and galleries over four images are rejected", async (t) => {
  const product = setup(t, async () => { assert.fail("must not call S3"); });
  product.save = async () => { assert.fail("must not save"); };
  for (const keys of [[newKey, newKey], [oldKey, newKey, oldKey, newKey, oldKey], null]) {
    const res = response();
    await updateProduct({ params: { id: "example" }, body: { imageKeys: keys } }, res);
    assert.equal(res.code, 400);
  }
});


test("creating a mobile product verifies and saves every gallery image", async (t) => {
  const verified = [];
  setup(t, async (command) => {
    assert.ok(command instanceof HeadObjectCommand);
    verified.push(command.input.Key);
    return { ContentType: "image/jpeg" };
  });
  t.mock.method(Product, "create", async (data) => data);
  const res = response();
  await createProduct({ body: {
    category: "mobile", title: "Phone", price: 10, stock: 1,
    imageKeys: [oldKey, newKey],
  } }, res);
  assert.equal(res.code, 201);
  assert.deepEqual(verified, [oldKey, newKey]);
  assert.deepEqual(res.body.imageKeys, [oldKey, newKey]);
  assert.equal(res.body.imageKey, oldKey);
});
