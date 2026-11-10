import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const maxProductImages = 4;
export const productCategories = ["mobile", "laptop", "accessories"];
export const maxImageBytes = 5 * 1024 * 1024;
export const validProductImageKey = (key, category) => typeof key === "string" &&
  new RegExp(`^products/${category || "(mobile|laptop|accessories)"}/[a-f0-9-]+\\.(jpg|png|webp)$`).test(key);

export function imageStorage() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!region || !bucket) {
    throw new Error("Set AWS_REGION and AWS_S3_BUCKET in packages/server/.env, then restart the backend");
  }
  return { s3: new S3Client({ region }), bucket };
}

// Older records may have stored a full S3 URL instead of an imageKey.
export function productImageKey(product) {
  if (product.imageKey) return product.imageKey;
  if (!product.imageUrl?.startsWith("https://")) return "";

  try {
    const url = new URL(product.imageUrl);
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;
    if (![`${bucket}.s3.${region}.amazonaws.com`, `${bucket}.s3.amazonaws.com`].includes(url.hostname)) return "";
    return decodeURIComponent(url.pathname.slice(1));
  } catch { return ""; }
}

export function productImageKeys(product) {
  return [...new Set([...(product.imageKeys || []), productImageKey(product)].filter(Boolean))];
}

export async function deleteProductImage(product) {
  const keys = productImageKeys(product);
  if (!keys.length) return { imageDeleted: false };
  // Validate every key before deleting any objects.
  if (keys.some((key) => typeof key !== "string" || !/^products\/(mobile|laptop|accessories)\//.test(key))) {
    throw new Error("Product image key is outside the product image folders; image deletion was stopped");
  }
  let retained = false;
  for (const key of keys) {
    const result = await deleteImageKey(key);
    retained ||= result.imageVersionRetained;
  }
  return { imageDeleted: true, imageVersionRetained: retained };
}

async function deleteImageKey(key) {
  if (typeof key !== "string" || !/^products\/(mobile|laptop|accessories)\//.test(key)) {
    throw new Error("Product image key is outside the product image folders; image deletion was stopped");
  }

  const { s3, bucket } = imageStorage();
  try {
    const result = await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return {
      imageDeleted: true,
      // S3 keeps previous versions when versioning is enabled.
      imageVersionRetained: Boolean(result.DeleteMarker),
    };
  } catch (error) {
    console.error("S3 image deletion failed", {
      code: error.name,
      status: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
    });
    const denied = error.name === "AccessDenied" || error.$metadata?.httpStatusCode === 403;
    throw new Error(denied
      ? "S3 denied image deletion. Grant ekart-backend s3:DeleteObject for this bucket's products/* objects. The product was kept; retry after fixing permissions."
      : "Could not delete the S3 image. The product was kept; check backend AWS settings and retry.",
    { cause: error });
  }
}

export const withImageUrl = async (product) => {
  const data = product.toObject();

  // Keep existing images working for products without an S3 key.
  const keys = productImageKeys(data);
  if (!keys.length) {
    data.imageUrls = [...new Set([data.imageUrl, data.image1, data.image2, data.image3, data.image4].filter(Boolean))];
    return data;
  }
  const { s3, bucket } = imageStorage();
  data.imageKeys = keys;
  data.imageUrls = await Promise.all(keys.map((key) => getSignedUrl(
    s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 }
  )));
  data.imageUrl = data.imageUrls[0] || "";
  // Keep existing cards and cart consumers compatible.
  for (let index = 0; index < 4; index++) data[`image${index + 1}`] = data.imageUrls[index] || "";

  return data;
};


export function imageReferenceQuery(key) {
  const escape = (value) => value.replace(/[^a-zA-Z0-9_/-]/g, (char) => String.fromCharCode(92) + char);
  const bucket = process.env.AWS_S3_BUCKET || "";
  const region = process.env.AWS_REGION || "";
  const urls = [
    `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
    `https://${bucket}.s3.amazonaws.com/${key}`,
  ].map(escape);
  return { $or: [
    { imageKey: key }, { imageKeys: key },
    { imageUrl: { $regex: "^(" + urls.join("|") + ")([?]|$)" } },
  ] };
}
