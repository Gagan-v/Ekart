import { test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import User from "../model/User.js";
import Product from "../model/Product.js";
import { placeOrder, getOrders } from "../controllers/orderController.js";
const id = "507f1f77bcf86cd799439011";
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const customer = () => new User({ name: "Customer", email: "customer@example.com", password: "password", cart: [{ productId: id, quantity: 2 }] });
test("checkout saves server prices and item snapshots, clears cart in the same save, and timestamps unpaid orders", async t => {
  t.mock.method(Product, "find", async () => [{ _id: id, title: "Phone", category: "mobile", price: 12.34, stock: 3 }]);
  const user = customer();
  let saves = 0;
  user.save = async () => { saves++; assert.equal(user.orders.length, 1); assert.equal(user.cart.length, 0); };
  const res = response();
  const before = Date.now();
  await placeOrder({ user, body: { total: 1, userId: "another-user" } }, res);
  assert.equal(res.code, 201);
  assert.equal(saves, 1);
  assert.equal(res.body.order.total, 24.68);
  assert.equal(res.body.order.items[0].title, "Phone");
  assert.equal(res.body.order.items[0].quantity, 2);
  assert.equal(res.body.order.paymentStatus, "pending");
  assert.ok(res.body.order.createdAt.getTime() >= before);
  const second = response();
  await placeOrder({ user }, second);
  assert.equal(second.code, 400);
  assert.equal(saves, 1);
});
test("unavailable or deleted products leave cart and history untouched", async t => {
  for (const products of [[], [{ _id: id, price: 10, stock: 1 }]]) {
    t.mock.method(Product, "find", async () => products);
    const user = customer();
    user.save = () => assert.fail("must not save");
    const res = response();
    await placeOrder({ user }, res);
    assert.equal(res.code, 409);
    assert.equal(user.cart.length, 1);
    assert.equal(user.orders.length, 0);
  }
});
test("concurrent cart changes return conflict without claiming success", async t => {
  t.mock.method(Product, "find", async () => [{ _id: id, title: "Phone", price: 10, stock: 3 }]);
  const user = customer();
  user.save = async () => { throw new mongoose.Error.VersionError(user, 0, ["cart"]); };
  const res = response();
  await placeOrder({ user }, res);
  assert.equal(res.code, 409);
  assert.equal(res.body.order, undefined);
});
test("history only returns the authenticated customer's orders, newest first", () => {
  const res = response();
  const orders = [{ _id: "old" }, { _id: "new" }];
  getOrders({ user: { orders }, query: { userId: "another-user" } }, res);
  assert.deepEqual(res.body.orders.map(order => order._id), ["new", "old"]);
  assert.equal(orders[0]._id, "old");
});
