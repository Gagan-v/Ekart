import mongoose from "mongoose";
import Product from "../model/Product.js";
import { withImageUrl } from "../services/productImages.js";

export async function cartResponse(user) {
  const products = await Product.find({ _id: { $in: user.cart.map((item) => item.productId) } });
  const byId = new Map(products.map((product) => [String(product._id), product]));
  const items = [];
  for (const item of user.cart) {
    const product = byId.get(String(item.productId));
    if (!product) continue;
    const data = await withImageUrl(product);
    items.push({ id: product._id, productId: product._id, title: product.title, price: product.price,
      image1: data.imageUrl || data.image1 || "", category: product.category, stock: product.stock,
      quantity: item.quantity, available: item.quantity <= product.stock });
  }
  return { cart: items };
}

export const getCart = async (req, res) => {
  try { return res.json(await cartResponse(req.user)); }
  catch { return res.status(500).json({ message: "Could not load cart" }); }
};

async function changeQuantity(req, res, add) {
  try {
    const { productId, quantity = add ? 1 : undefined } = req.body ?? {};
    if (!mongoose.isValidObjectId(productId) || typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "A valid product and positive whole quantity are required" });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product is no longer available" });
    const item = req.user.cart.find((entry) => String(entry.productId) === String(productId));
    if (!add && !item) return res.status(404).json({ message: "Item not found in cart" });
    const total = add ? (item?.quantity || 0) + quantity : quantity;
    if (!Number.isSafeInteger(total) || total > product.stock) return res.status(409).json({ message: `Only ${product.stock} available in stock` });
    if (item) item.quantity = total;
    else req.user.cart.push({ productId, quantity: total });
    await req.user.save();
    return res.json(await cartResponse(req.user));
  } catch (error) { return res.status(error.name === "VersionError" ? 409 : 500).json({ message: "Could not update cart. Reload and retry." }); }
}
export const addToCart = (req, res) => changeQuantity(req, res, true);
export const updateCartItem = (req, res) => changeQuantity(req, res, false);
export const removeFromCart = async (req, res) => {
  try {
    req.user.cart = req.user.cart.filter((item) => String(item.productId) !== req.params.id);
    await req.user.save();
    return res.json(await cartResponse(req.user));
  } catch { return res.status(500).json({ message: "Could not remove item" }); }
};
export const clearCart = async (req, res) => {
  try {
    req.user.cart = [];
    await req.user.save();
    return res.json({ cart: [] });
  } catch { return res.status(500).json({ message: "Failed to clear cart" }); }
};
