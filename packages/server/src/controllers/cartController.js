import User from "../model/User.js";
import Product from "../model/Product.js";

// Get user's cart with populated product details
export const getCart = async (req, res) => {
  try {
    const user = req.user;
    // Populate product details for each cart item
    const populatedUser = await User.findById(user._id).populate(
      "cart.productId"
    );

    // Transform cart items to include product details
    const cartItems = populatedUser.cart.map((item) => ({
      id: item.productId._id,
      productId: item.productId._id,
      title: item.productId.title,
      price: item.productId.price,
      image1: item.productId.image1,
      category: item.productId.category,
      quantity: item.quantity,
    }));

    return res.json({ cart: cartItems });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

// Add a product to the logged-in user's cart (identified by x-user-id or body.userId)
// If the product already exists in cart, increment quantity
export const addToCart = async (req, res) => {
  try {
    const user = req.user; // attached by attachUserById middleware
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    const qty = Math.max(1, Number(quantity) || 1);

    const existing = user.cart.find(
      (item) => String(item.productId) === String(productId)
    );
    if (existing) {
      existing.quantity += qty;
    } else {
      user.cart.push({ productId, quantity: qty });
    }

    await user.save();

    // Return updated cart with populated product details
    const populatedUser = await User.findById(user._id).populate(
      "cart.productId"
    );
    const cartItems = populatedUser.cart.map((item) => ({
      id: item.productId._id,
      productId: item.productId._id,
      title: item.productId.title,
      price: item.productId.price,
      image1: item.productId.image1,
      category: item.productId.category,
      quantity: item.quantity,
    }));

    return res.json({ cart: cartItems });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

// Update quantity for a product in the user's cart
export const updateCartItem = async (req, res) => {
  try {
    const user = req.user;
    const { productId, quantity } = req.body;
    const qtyNum = Number(quantity);
    if (!productId || !Number.isInteger(qtyNum) || qtyNum < 1) {
      return res
        .status(400)
        .json({ message: "productId and positive quantity required" });
    }
    const item = user.cart.find(
      (ci) => String(ci.productId) === String(productId)
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    item.quantity = qtyNum;
    await user.save();

    // Return updated cart with populated product details
    const populatedUser = await User.findById(user._id).populate(
      "cart.productId"
    );
    const cartItems = populatedUser.cart.map((item) => ({
      id: item.productId._id,
      productId: item.productId._id,
      title: item.productId.title,
      price: item.productId.price,
      image1: item.productId.image1,
      category: item.productId.category,
      quantity: item.quantity,
    }));

    return res.json({ cart: cartItems });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

// Remove a product from the user's cart
export const removeFromCart = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params; // productId
    const before = user.cart.length;
    user.cart = user.cart.filter((ci) => String(ci.productId) !== String(id));
    if (user.cart.length === before) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    await user.save();

    // Return updated cart with populated product details
    const populatedUser = await User.findById(user._id).populate(
      "cart.productId"
    );
    const cartItems = populatedUser.cart.map((item) => ({
      id: item.productId._id,
      productId: item.productId._id,
      title: item.productId.title,
      price: item.productId.price,
      image1: item.productId.image1,
      category: item.productId.category,
      quantity: item.quantity,
    }));

    return res.json({ cart: cartItems });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};
