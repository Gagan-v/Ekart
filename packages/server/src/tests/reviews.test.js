import { test } from "node:test";
import assert from "node:assert/strict";
import Product from "../model/Product.js";
import ProductReview from "../model/ProductReview.js";
import { addReview, getMyReviews } from "../controllers/reviewController.js";
const productId = "507f1f77bcf86cd799439011";
const userId = "507f1f77bcf86cd799439012";
const buyer = { _id: userId, orders: [{ items: [{ productId }] }] };
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });

test("ratings require a product in the authenticated customer's order history", async t => {
  t.mock.method(ProductReview.prototype, "save", () => assert.fail("must not save"));
  const res = response();
  await addReview({ user: { _id: userId, orders: [] }, body: { productId, rating: 5, userId: "another-user" } }, res);
  assert.equal(res.code, 403);
});
test("reject invalid star values, invalid IDs, and oversized comments", async () => {
  for (const body of [{ productId: "bad", rating: 5 }, ...[0, 6, 2.5, "5", null].map(rating => ({productId, rating})), {productId, rating: 5, comment: "a".repeat(501)}]) {
    const res = response();
    await addReview({ user: buyer, body }, res);
    assert.equal(res.code, 400);
  }
});
test("a buyer can submit stars without a comment and totals update from all ratings", async t => {
  t.mock.method(Product, "findById", async () => ({ _id: productId }));
  t.mock.method(ProductReview, "findOne", async () => null);
  t.mock.method(ProductReview.prototype, "save", async function () { assert.equal(String(this.userId), userId); assert.equal(this.comment, ""); });
  t.mock.method(ProductReview, "find", async () => [{ rating: 5 }, { rating: 4 }]);
  let stats;
  t.mock.method(Product, "findByIdAndUpdate", async (id, update) => { assert.equal(id, productId); stats = update; });
  const res = response();
  await addReview({ user: buyer, body: { productId, rating: 5, userId: "spoofed-user" } }, res);
  assert.equal(res.code, 201);
  assert.equal(res.body.data.rating, 5);
  assert.deepEqual(stats, { averageRating: 4.5, reviewCount: 2 });
});
test("repeat orders cannot create duplicate ratings for the same product", async t => {
  t.mock.method(Product, "findById", async () => ({ _id: productId }));
  t.mock.method(ProductReview, "findOne", async () => ({ rating: 4 }));
  t.mock.method(ProductReview.prototype, "save", () => assert.fail("must not save"));
  const res = response();
  await addReview({ user: buyer, body: { productId, rating: 5 } }, res);
  assert.equal(res.code, 409);
});
test("concurrent duplicate rating submissions return conflict", async t => {
  t.mock.method(Product, "findById", async () => ({ _id: productId }));
  t.mock.method(ProductReview, "findOne", async () => null);
  t.mock.method(ProductReview.prototype, "save", async () => { throw { code: 11000 }; });
  const res = response();
  await addReview({ user: buyer, body: { productId, rating: 5 } }, res);
  assert.equal(res.code, 409);
});
test("my ratings always selects the signed-in customer", async t => {
  t.mock.method(ProductReview, "find", filter => {
    assert.deepEqual(filter, { userId });
    return { select() { return { lean: async () => [{ productId, rating: 4 }] }; } };
  });
  const res = response();
  await getMyReviews({ user: buyer, query: { userId: "another-user" } }, res);
  assert.equal(res.body.reviews[0].rating, 4);
});
