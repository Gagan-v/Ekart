import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const mobileImagePrefix = "products/mobile/";

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

  const url = new URL(product.imageUrl);
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  const hosts = [
    `${bucket}.s3.${region}.amazonaws.com`,
    `${bucket}.s3.amazonaws.com`,
  ];
  if (!hosts.includes(url.hostname)) return "";
  return decodeURIComponent(url.pathname.slice(1));
}

export async function deleteProductImage(product) {
  const key = productImageKey(product);
  if (!key) return { imageDeleted: false };
  if (typeof key !== "string" || !key.startsWith(mobileImagePrefix)) {
    throw new Error("Product image key is outside products/mobile/; image deletion was stopped");
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
