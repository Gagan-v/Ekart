import express from "express";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { adminAuth } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

router.post("/presign", adminAuth, async (req, res) => {
  try {
    const { contentType } = req.body ?? {};

    if (!Object.hasOwn(imageTypes, contentType)) {
      return res.status(400).json({
        message: "Only JPEG, PNG, and WebP images are allowed",
      });
    }

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
    });

    const extension = imageTypes[contentType];
    const key = `products/mobile/${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
    });

    return res.json({ uploadUrl, key });
  } catch (error) {
    console.error("S3 upload preparation failed:", error);

    return res.status(500).json({
      message: "Could not prepare image upload",
    });
  }
});

export default router;