import { test } from "node:test";
import assert from "node:assert/strict";
import { clearCart } from "../controllers/cartController.js";

function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
test("clear cart persists the empty cart before returning success", async () => {
  let saved = false;
  const user = { cart: [{ productId: "example", quantity: 2 }], async save() { assert.deepEqual(this.cart, []); saved = true; } };
  const res = response();
  await clearCart({ user }, res);
  assert.equal(saved, true);
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { cart: [] });
});
test("clear cart reports persistence failures", async () => {
  const user = { cart: [], async save() { throw new Error("Database unavailable"); } };
  const res = response();
  await clearCart({ user }, res);
  assert.equal(res.code, 500);
  assert.equal(res.body.message, "Failed to clear cart");
});
