import "../config/env.js";
import mongoose from "mongoose";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import Product from "../model/Product.js";
import { imageStorage, productCategories, productImageKeys } from "../services/productImages.js";
import { scheduleCleanup } from "../services/imageCleanup.js";

// Read-only by default. --schedule queues old unreferenced objects for the worker,
// which checks references again immediately before deleting them.
try {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find().select("imageKey imageKeys imageUrl").lean();
  const referenced = new Set(products.flatMap(productImageKeys));
  const { s3, bucket } = imageStorage();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const candidates = [];
  for (const category of productCategories) {
    let token;
    do {
      const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `products/${category}/`, ContinuationToken: token }));
      for (const object of page.Contents || []) {
        if (object.Key && !object.Key.endsWith("/") && object.LastModified?.getTime() < cutoff && !referenced.has(object.Key)) candidates.push(object.Key);
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
  }
  console.log(JSON.stringify({ bucket, mode: process.argv.includes("--schedule") ? "schedule" : "dry-run", candidates }, null, 2));
  if (process.argv.includes("--schedule")) await scheduleCleanup(candidates);
} catch (error) {
  console.error("Image audit failed", { code: error.name, message: error.name === "AccessDenied" ? "The audit requires s3:ListBucket for the bucket's products/ prefixes." : "Check database and AWS configuration." });
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
