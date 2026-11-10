import { Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/config";

const AddCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [cartError, setCartError] = useState("");
  const navigate = useNavigate();
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const storeCart = (items) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  useEffect(() => {
    let active = true;
    let sequence = 0;
    const load = async () => {
      const requestId = ++sequence;
      setLoading(true);
      try {
        const session = await apiFetch("/api/auth/me");
        let items;
        if (session.ok) {
          const response = await apiFetch("/api/cart");
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Could not load cart");
          items = data.cart;
        } else if (session.status === 401) {
          let saved;
          try { saved = JSON.parse(localStorage.getItem("cart") || "[]"); } catch { saved = []; }
          const response = await apiFetch("/api/admin/products");
          if (!response.ok) throw new Error("Could not refresh cart products");
          const products = await response.json();
          const byId = new Map(products.map((product) => [product._id, product]));
          items = (Array.isArray(saved) ? saved : []).flatMap((item) => {
            const product = byId.get(item?.id);
            if (!product) return [];
            const quantity = Number.isSafeInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
            return [{ id: product._id, title: product.title, price: product.price,
              image1: product.imageUrl || product.image1 || "", category: product.category,
              quantity, stock: product.stock, available: quantity <= product.stock }];
          });
        } else throw new Error("Could not verify your session");
        if (active && requestId === sequence) { storeCart(items); setCartError(""); }
      } catch (error) {
        if (active && requestId === sequence) setCartError(error.message || "Could not load cart");
      } finally { if (active && requestId === sequence) setLoading(false); }
    };
    void load();
    window.addEventListener("authStateChanged", load);
    return () => { active = false; window.removeEventListener("authStateChanged", load); };
  }, []);

  const mutate = async (path, method, body, guestChange) => {
    if (clearing) return;
    setClearing(true);
    setCartError("");
    try {
      const hadSession = Boolean(localStorage.getItem("authUser"));
      const session = await apiFetch("/api/auth/me");
      if (session.ok) {
        const response = await apiFetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body && { body: JSON.stringify(body) }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not update cart");
        storeCart(data.cart);
      } else if (session.status === 401) {
        if (hadSession) throw new Error("Session expired. Please sign in again.");
        storeCart(guestChange());
      } else throw new Error("Could not verify your session");
    } catch (error) { setCartError(error.message || "Could not update cart"); }
    finally { setClearing(false); }
  };
  const updateQuantity = (productId, quantity) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    return mutate("/api/cart/update", "PUT", { productId, quantity }, () => {
      const item = cartItems.find((entry) => entry.id === productId);
      if (!item || quantity > item.stock) throw new Error(`Only ${item?.stock || 0} available in stock`);
      return cartItems.map((entry) => entry.id === productId ? { ...entry, quantity, available: true } : entry);
    });
  };
  const removeItem = (id) => mutate(`/api/cart/remove/${id}`, "DELETE", null, () => cartItems.filter((item) => item.id !== id));
  const clearCart = () => mutate("/api/cart", "DELETE", null, () => []);

  // Payment is a separate route; navigating does not place an order or empty the cart.
  const handleBuyNow = () => navigate("/payment");

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-600">
              Loading cart...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some products to get started!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {cartError && <Alert severity="error" sx={{ mb: 3 }}>{cartError}</Alert>}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.filter(Boolean).length} item
            {cartItems.filter(Boolean).length !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Cart Items List */}
              <div className="divide-y divide-gray-200">
                {cartItems.filter(Boolean).map((item) => {
                  if (!item || !item.id) return null;

                  return (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            {item.image1 ? (
                              <img
                                src={item.image1}
                                alt={item.title || "Product"}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-center">
                                <div className="text-2xl text-gray-400 mb-1">
                                  {item.category === "mobile"
                                    ? "📱"
                                    : item.category === "laptop"
                                      ? "💻"
                                      : "🎧"}
                                </div>
                                <p className="text-gray-500 text-xs">
                                  No Image
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {item.title || "Unknown Product"}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize mb-2">
                            {item.category || "uncategorized"}
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            ₹{(item.price || 0).toLocaleString()}
                          </p>
                        </div>

                        {item.available === false && <span className="text-sm text-red-600">Only {item.stock} available</span>}
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, (item.quantity || 1) - 1)
                            }
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-semibold transition-colors"
                            disabled={clearing || (item.quantity || 1) <= 1}
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-800">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, (item.quantity || 1) + 1)
                            }
                            disabled={clearing || item.quantity >= item.stock}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-semibold transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 p-2 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                          title="Remove item"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clear Cart Button */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={clearCart}
                  disabled={clearing}
                  className="text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  {clearing ? "Clearing…" : "Clear Cart"}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal ({cartItems.filter(Boolean).length} items)
                  </span>
                  <span>₹{(totalPrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{(totalPrice || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  disabled={clearing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-green-700 font-medium">
                    Payment preview
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Payment integration is coming soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCart;
