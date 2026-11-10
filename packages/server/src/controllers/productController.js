import ImageUpload from "../model/ImageUpload.js";
import { scheduleCleanup } from "../services/imageCleanup.js";
import Product from "../model/Product.js";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { deleteProductImage, imageStorage, validProductImageKey, productCategories, maxImageBytes, imageReferenceQuery, productImageKeys, maxProductImages, withImageUrl } from "../services/productImages.js";

function validateImageKeys(keys, category) {
  if (!Array.isArray(keys) || keys.length > maxProductImages || new Set(keys).size !== keys.length ||
      keys.some((key) => !validProductImageKey(key, category))) {
    return "Use up to four unique uploaded product images";
  }
  return "";
}

async function verifyImages(keys, adminId) {
  if (!keys.length) return;
  const { s3, bucket } = imageStorage();
  for (const key of keys) {
    // Extend the pending upload lease before attaching it to a product.
    const upload = await ImageUpload.findOneAndUpdate({ key, adminId, state: "pending", cleanupAfter: { $gt: new Date() } },
      { $set: { cleanupAfter: new Date(Date.now() + 24 * 60 * 60 * 1000) } }, { new: true });
    if (!upload) throw new Error("Upload is missing, expired, or belongs to another admin");
    if (await Product.exists(imageReferenceQuery(key))) throw new Error("Image is already attached to another product");
    const image = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    if (image.ContentLength > maxImageBytes || !["image/jpeg", "image/png", "image/webp"].includes(image.ContentType)) {
      throw new Error("Invalid image type");
    }
  }
}


export const createProduct = async (req, res) => {
  try {
    //we need to run conditions before creating the product
    // Removed subCategory from destructuring - now using only main categories
    const {
      category,
      title,
      price,
      stock,
      specs,
      imageUrl = "",
      imageKey = "",
      imageKeys,
    } = req.body;
    if (!category || !title || price == null || stock == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const numericPrice = Number(price);
    const numericStock = Number(stock);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a non-negative number" });
    }
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return res
        .status(400)
        .json({ message: "Stock must be a non-negative integer" });
    }
    const keys = imageKeys === undefined ? (imageKey ? [imageKey] : []) : imageKeys;
    const imageError = validateImageKeys(keys, category);
    if (imageError || !productCategories.includes(category)) {
      return res.status(400).json({ message: imageError || "Choose a valid product category" });
    }
    if (keys.length) {
      try { await verifyImages(keys, req.admin?._id); }
      catch { return res.status(400).json({ message: "Could not verify uploaded images in S3. Check AWS access and retry." }); }
    }
    const specsArray = Array.isArray(specs)
      ? specs
      : typeof specs === "string"
        ? specs
            .split("\n")
            .map((s) => s.replace(/^•\s*/, "").trim())
            .filter(Boolean)
        : [];

    // Create product with simplified category structure (no subCategory)
    const product = await Product.create({
      category,
      title,
      price: numericPrice,
      stock: numericStock,
      specs: specsArray,
      imageUrl,
      imageKey: keys[0] || "",
      imageKeys: keys,
      createdBy: req.user?.id,
    });
    return res.status(201).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

export const getProducts = async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const productsWithImages = await Promise.all(
      products.map(withImageUrl)
    );
    return res.json(productsWithImages);
  } catch {
    return res.status(500).json({ message: "server error while getting" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const body = req.body ?? {};
    const changes = {};
    if (Object.hasOwn(body, "title")) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return res.status(400).json({ message: "Product title is required" });
      }
      changes.title = body.title.trim();
    }
    for (const field of ["price", "stock"]) {
      if (!Object.hasOwn(body, field)) continue;
      const value = body[field];
      const number = Number(value);
      if ((typeof value !== "number" && typeof value !== "string") ||
          String(value).trim() === "" || !Number.isFinite(number) || number < 0 ||
          (field === "stock" && !Number.isInteger(number))) {
        return res.status(400).json({ message: `${field === "stock" ? "Stock must be a non-negative integer" : "Price must be a non-negative number"}` });
      }
      changes[field] = number;
    }
    if (Object.hasOwn(body, "specs")) {
      if (typeof body.specs !== "string" &&
          !(Array.isArray(body.specs) && body.specs.every((s) => typeof s === "string"))) {
        return res.status(400).json({ message: "Specifications must be text or an array of text" });
      }
      changes.specs = (Array.isArray(body.specs) ? body.specs : body.specs.split("\n"))
        .map((s) => s.replace(/^•\s*/, "").trim()).filter(Boolean);
    }

    const oldKeys = productImageKeys(product);
    const editingImages = Object.hasOwn(body, "imageKeys") || Object.hasOwn(body, "imageKey");
    const nextKeys = Object.hasOwn(body, "imageKeys") ? body.imageKeys : [body.imageKey];
    if (editingImages) {
      const imageError = validateImageKeys(nextKeys, product.category);
      if (imageError) {
        return res.status(400).json({ message: imageError });
      }
      try { await verifyImages(nextKeys.filter((key) => !oldKeys.includes(key)), req.admin?._id); }
      catch { return res.status(400).json({ message: "Could not verify uploaded images in S3. Upload them again or check AWS access." }); }
      changes.imageKeys = nextKeys;
      changes.imageKey = nextKeys[0] || "";
      changes.imageUrl = "";
      for (let index = 1; index <= 4; index++) changes[`image${index}`] = "";
    }

    if (editingImages) await scheduleCleanup(oldKeys.filter((key) => !nextKeys.includes(key)));
    Object.assign(product, changes);
    // Prepare the response before saving so a signing error cannot hide a saved update.
    const updatedProduct = await withImageUrl(product);
    await product.save();

    let warning;
    if (editingImages) {
      for (const key of oldKeys.filter((key) => !nextKeys.includes(key))) {
        try { await deleteProductImage({ imageKey: key }); }
        catch { warning = "Product saved, but some removed images could not be deleted from S3."; }
      }
    }
    return res.json({ product: updatedProduct, ...(warning && { warning }) });
  } catch (err) {
    console.error("Product update failed", { code: err.name, message: err.message });
    if (err.name === "CastError" || err.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid product details" });
    }
    return res.status(500).json({ message: "Could not save product. Please retry." });
  }
};

export const getProduct = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(await withImageUrl(prod));
  } catch {
    return res.status(500).json({ message: "server error" });
  }
};

export const getProductsCount = async (_req, res) => {
  try {
    const count = await Product.countDocuments();
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await scheduleCleanup(productImageKeys(product));
    const imageResult = await deleteProductImage(product);
    await product.deleteOne();
    return res.json({ message: "Product deleted", id, ...imageResult });
  } catch (err) {
    console.error("Product deletion failed", { code: err.name, message: err.message });
    return res.status(500).json({ message: err.message || "Could not delete product" });
  }
};

export const reduceProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body || {};
    const reduceBy = Number(quantity);
    if (!Number.isInteger(reduceBy) || reduceBy <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive integer" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (reduceBy > product.stock) {
      return res
        .status(400)
        .json({ message: "Quantity exceeds current stock" });
    }

    const newStock = product.stock - reduceBy;
    if (newStock === 0) {
      await scheduleCleanup(productImageKeys(product));
      const imageResult = await deleteProductImage(product);
      await product.deleteOne();
      return res.json({
        message: "Product deleted as stock reached 0",
        id,
        stock: 0,
        deleted: true,
        ...imageResult,
      });
    }

    product.stock = newStock;
    await product.save();
    return res.json({
      message: "Stock reduced",
      id,
      stock: newStock,
      deleted: false,
    });
  } catch (err) {
    console.error("Stock reduction failed", { code: err.name, message: err.message });
    return res.status(500).json({ message: err.message || "Could not reduce stock" });
  }
};
