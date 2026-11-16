import Product from "../model/Product.js";

export const getOrders = (req, res) => res.json({ orders: [...req.user.orders].reverse() });

export async function placeOrder(req, res) {
  try {
    const user = req.user;
    if (!user.cart.length) return res.status(400).json({ message: "Your cart is empty" });
    const products = await Product.find({ _id: { $in: user.cart.map(item => item.productId) } });
    const byId = new Map(products.map(product => [String(product._id), product]));
    const items = [];
    let total = 0;
    for (const entry of user.cart) {
      const product = byId.get(String(entry.productId));
      if (!product || !Number.isSafeInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > product.stock) {
        return res.status(409).json({ message: "Some items are unavailable. Update your cart and try again." });
      }
      const price = Math.round(product.price * 100);
      if (!Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(total + price * entry.quantity)) {
        return res.status(409).json({ message: "A product price is unavailable. Please try again later." });
      }
      total += price * entry.quantity;
      items.push({ productId: product._id, title: product.title, category: product.category, price: price / 100, quantity: entry.quantity });
    }
    user.orders.push({ items, total: total / 100, createdAt: new Date(), status: "placed", paymentStatus: "pending" });
    user.cart = [];
    // One version-checked document save records the order and clears the cart together.
    // Concurrent checkout/cart changes fail instead of creating duplicate orders.
    await user.save();
    return res.status(201).json({ order: user.orders[user.orders.length - 1] });
  } catch (error) {
    return res.status(error.name === "VersionError" ? 409 : 500).json({ message:
      error.name === "VersionError" ? "Your cart changed. Refresh checkout before trying again." : "Could not place order. Check My orders before retrying." });
  }
}
