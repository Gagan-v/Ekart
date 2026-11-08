import Product from "../model/Product.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { deleteProductImage, imageStorage, mobileImagePrefix, productImageKey } from "../services/productImages.js";

const withImageUrl = async (product) => {
  const data = product.toObject();

  // Keep existing images working for products without an S3 key.
  const key = productImageKey(data);
  if (!key) {
    return data;
  }

  const { s3, bucket } = imageStorage();

  data.imageUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn: 3600 }
  );

  return data;
};

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
    if (imageKey && (category !== "mobile" || typeof imageKey !== "string" || !imageKey.startsWith(mobileImagePrefix))) {
      return res.status(400).json({ message: "S3 images must use the mobile product image prefix" });
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
      imageKey,
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
