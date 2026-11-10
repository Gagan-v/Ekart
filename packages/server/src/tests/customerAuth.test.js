import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../model/User.js";
import { customerAuth } from "../middleware/authMiddleware.js";
import { loginUser, updateUser, logoutUser } from "../controllers/authController.js";
import { setSession } from "../services/customerSession.js";

function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; },
    cookie(name, value, options) { this.cookieValue = value; this.options = options; }, clearCookie() { this.cleared = true; } };
}
function setup(t) {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-customer-secret";
  t.after(() => { if (previous === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previous; });
  const user = { _id: "507f1f77bcf86cd799439011", name: "Alice", email: "alice@example.com", sessionVersion: 0, password: "hash", async save() {} };
  t.mock.method(User, "findById", async () => user);
  t.mock.method(User, "findOne", async () => null);
  return user;
}

test("a supplied user ID alone cannot authenticate", async (t) => {
  setup(t);
  const res = response();
  await customerAuth({ cookies: {}, body: { userId: "victim" }, headers: { "x-user-id": "victim" } }, res, () => assert.fail("unauthenticated"));
  assert.equal(res.code, 401);
});
test("customer cookie is HttpOnly and selects the user from its signed subject", async (t) => {
  const user = setup(t);
  const cookie = response();
  setSession(cookie, user);
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.sameSite, "lax");
  const req = { cookies: { ekart_session: cookie.cookieValue }, body: { userId: "victim" } };
  let next = false;
  await customerAuth(req, response(), () => { next = true; });
  assert.equal(next, true);
  assert.equal(req.user, user);
});
test("admin tokens, expired cookies, and invalidated session versions are rejected", async (t) => {
  const user = setup(t);
  const adminToken = jwt.sign({ id: user._id, role: "admin" }, process.env.JWT_SECRET);
  const expired = jwt.sign({ version: 0 }, process.env.JWT_SECRET, { subject: user._id, audience: "ekart-customer", issuer: "ekart", expiresIn: -1 });
  const cookie = response(); setSession(cookie, user); user.sessionVersion = 1;
  for (const token of [adminToken, expired, cookie.cookieValue, "tampered"]) {
    const res = response();
    await customerAuth({ cookies: { ekart_session: token } }, res, () => assert.fail("must reject"));
    assert.equal(res.code, 401);
  }
});
test("login sets a cookie without exposing password or a token in JSON", async (t) => {
  const user = setup(t);
  t.mock.method(User, "findOne", async () => user);
  t.mock.method(bcrypt, "compare", async () => true);
  const res = response();
  await loginUser({ body: { username: "Alice", password: "password" } }, res);
  assert.equal(res.body.name, "Alice");
  assert.equal(res.body.password, undefined);
  assert.equal(res.body.token, undefined);
  assert.ok(res.cookieValue);
});
test("password change requires the current password and never looks up body.userId", async (t) => {
  const user = setup(t);
  t.mock.method(bcrypt, "compare", async () => false);
  let saved = false; user.save = async () => { saved = true; };
  const res = response();
  await updateUser({ user, body: { userId: "victim", password: "new-password", currentPassword: "wrong" } }, res);
  assert.equal(res.code, 403);
  assert.equal(saved, false);
});
test("successful password change invalidates old sessions and refreshes the current cookie", async (t) => {
  const user = setup(t);
  t.mock.method(bcrypt, "compare", async () => true);
  t.mock.method(bcrypt, "hash", async () => "new-hash");
  const res = response();
  await updateUser({ user, body: { password: "new-password", currentPassword: "old-password" } }, res);
  assert.equal(res.code, 200);
  assert.equal(user.sessionVersion, 1);
  assert.equal(user.password, "new-hash");
  assert.ok(res.cookieValue);
});
test("logout invalidates signed sessions server-side", async (t) => {
  const user = setup(t);
  t.mock.method(User, "updateOne", async (query, change) => {
    assert.equal(query._id, user._id);
    assert.deepEqual(change, { $inc: { sessionVersion: 1 } });
  });
  const res = response();
  await logoutUser({ user }, res);
  assert.equal(res.cleared, true);
});
