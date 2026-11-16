import ImageUpload from "../model/ImageUpload.js";
import Product from "../model/Product.js";
import { deleteProductImage, imageReferenceQuery } from "./productImages.js";

export async function scheduleCleanup(keys, delayMs = 10 * 60 * 1000) {
  for (const key of keys) {
    await ImageUpload.updateOne({ key }, { $setOnInsert: { key, state: "pending" }, $min: { cleanupAfter: new Date(Date.now() + delayMs) } }, { upsert: true });
  }
}
export async function cleanupImages() {
  // Recover interrupted work. A record is never TTL-expired before its S3 object is removed.
  await ImageUpload.updateMany({ state: "cleaning", updatedAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } }, { $set: { state: "pending" } });
  const due = await ImageUpload.find({ state: "pending", cleanupAfter: { $lte: new Date() } }).limit(100);
  for (const candidate of due) {
    const record = await ImageUpload.findOneAndUpdate({ _id: candidate._id, state: "pending", cleanupAfter: { $lte: new Date() } }, { $set: { state: "cleaning" } }, { new: true });
    if (!record) continue;
    try {
      const referenced = await Product.exists(imageReferenceQuery(record.key));
      if (referenced) {
        await ImageUpload.updateOne({ _id: record._id }, { $set: { state: "pending", cleanupAfter: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
        continue;
      }
      await deleteProductImage({ imageKey: record.key });
      await ImageUpload.deleteOne({ _id: record._id });
    } catch (error) {
      await ImageUpload.updateOne({ _id: record._id }, { $set: { state: "pending", cleanupAfter: new Date(Date.now() + 60 * 60 * 1000), lastError: error.name }, $inc: { attempts: 1 } });
    }
  }
}
export function startImageCleanup() {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try { await cleanupImages(); }
    catch (error) { console.error("Image cleanup failed", { code: error.name }); }
    finally { running = false; }
  };
  void run();
  const timer = setInterval(run, 5 * 60 * 1000);
  timer.unref();
  return () => clearInterval(timer);
}
