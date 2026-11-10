import { test } from "node:test";
import assert from "node:assert/strict";
import { S3Client } from "@aws-sdk/client-s3";
import Product from "../model/Product.js";
import ImageUpload from "../model/ImageUpload.js";
import { cleanupImages } from "../services/imageCleanup.js";
function setup(t, referenced, fail = false) {
  const calls = { deleted: [], updates: [], recordsDeleted: [] };
  const record = { _id: "upload", key: "products/mobile/example.jpg" };
  t.mock.method(ImageUpload, "updateMany", async () => ({}));
  t.mock.method(ImageUpload, "find", () => ({ limit: async () => [record] }));
  t.mock.method(ImageUpload, "findOneAndUpdate", async () => record);
  t.mock.method(ImageUpload, "updateOne", async (_query, change) => { calls.updates.push(change); });
  t.mock.method(ImageUpload, "deleteOne", async (query) => { calls.recordsDeleted.push(query); });
  t.mock.method(Product, "exists", async () => referenced);
  const previous = { region: process.env.AWS_REGION, bucket: process.env.AWS_S3_BUCKET };
  process.env.AWS_REGION = "us-east-2"; process.env.AWS_S3_BUCKET = "test-images";
  t.after(() => {
    for (const [key, value] of [["AWS_REGION", previous.region], ["AWS_S3_BUCKET", previous.bucket]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  t.mock.method(S3Client.prototype, "send", async (command) => { if (fail) throw new Error("offline"); calls.deleted.push(command.input.Key); return {}; });
  t.mock.method(console, "error", () => {});
  return calls;
}
test("cleanup keeps images still referenced by products", async (t) => {
  const calls = setup(t, true);
  await cleanupImages();
  assert.deepEqual(calls.deleted, []);
  assert.deepEqual(calls.recordsDeleted, []);
  assert.equal(calls.updates[0].$set.state, "pending");
});
test("unreferenced expired uploads are deleted before their tracking records", async (t) => {
  const calls = setup(t, false);
  await cleanupImages();
  assert.deepEqual(calls.deleted, ["products/mobile/example.jpg"]);
  assert.equal(calls.recordsDeleted.length, 1);
});
test("failed cleanup is retained for retry", async (t) => {
  const calls = setup(t, false, true);
  await cleanupImages();
  assert.equal(calls.recordsDeleted.length, 0);
  assert.equal(calls.updates[0].$inc.attempts, 1);
});
