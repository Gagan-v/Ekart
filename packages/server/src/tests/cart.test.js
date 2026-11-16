import { test } from "node:test";
import assert from "node:assert/strict";
import Product from "../model/Product.js";
import { addToCart, updateCartItem, getCart } from "../controllers/cartController.js";
const id = "507f1f77bcf86cd799439011";
function response() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
function setup(t) {
  const product = { _id: id, title: "Phone", stock: 3, price: 10, category: "mobile", toObject() { return { ...this }; } };
  t.mock.method(Product, "findById", async () => product);
  t.mock.method(Product, "find", async () => [product]);
  return product;
}
test("invalid quantities and unavailable stock never save cart changes", async (t) => {
  setup(t);
  const user = { cart: [], save() { assert.fail("must not save"); } };
  for (const quantity of [0, -1, 1.5, "2", null, 4]) {
    const res = response();
    await addToCart({ user, body: { productId: id, quantity } }, res);
    assert.ok([400, 409].includes(res.code));
  }
});
test("adding to existing quantity cannot exceed stock", async (t) => {
  setup(t);
  const user = { cart: [{ productId: id, quantity: 2 }], save() { assert.fail("must not save"); } };
  const res = response();
  await addToCart({ user, body: { productId: id, quantity: 2 } }, res);
  assert.equal(res.code, 409);
  assert.equal(user.cart[0].quantity, 2);
});
test("missing products are rejected on mutation and safely omitted on cart reads", async (t) => {
  setup(t);
  t.mock.method(Product, "findById", async () => null);
  t.mock.method(Product, "find", async () => []);
  const user = { cart: [{ productId: id, quantity: 1 }], save() { assert.fail("must not save"); } };
  const mutation = response();
  await updateCartItem({ user, body: { productId: id, quantity: 1 } }, mutation);
  assert.equal(mutation.code, 404);
  const read = response();
  await getCart({ user }, read);
  assert.deepEqual(read.body.cart, []);
});
test("cart updates persist and return current price and stock", async (t) => {
  setup(t);
  let saved = false;
  const user = { cart: [], async save() { saved = true; } };
  const res = response();
  await addToCart({ user, body: { productId: id, quantity: 2 } }, res);
  assert.equal(saved, true);
  assert.equal(res.code, 200);
  assert.equal(res.body.cart[0].quantity, 2);
  assert.equal(res.body.cart[0].price, 10);
  assert.equal(res.body.cart[0].stock, 3);
});
