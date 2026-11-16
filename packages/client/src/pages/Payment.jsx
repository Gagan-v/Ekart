import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/config";
import { OrderDetails } from "./Orders";

export default function Payment() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    apiFetch("/api/cart").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load checkout");
      if (active) setCart(data.cart);
    }).catch(error => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const placeOrder = async () => {
    if (busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await apiFetch("/api/orders", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not place order");
      setOrder(data.order);
      localStorage.setItem("cart", "[]");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) { setError(error.message || "Could not place order. Check My orders before retrying."); }
    finally { busy.current = false; setSubmitting(false); }
  };
  return <div className="payment-page">
    {order ? <><h1 role="status">Order successful!</h1><p>Your order has been saved. Payment is pending.</p><OrderDetails order={order} /><Link to="/orders">View My orders</Link></> : <>
      <Link className="text-link" to="/cart">← Back to cart</Link>
      <header><span className="eyebrow">Checkout</span><h1>Review your order</h1><p>Payment integration is coming soon. You can place your order now; no payment will be collected.</p></header>
      {loading && <p>Loading checkout…</p>}
      {error && <p role="alert">{error} <Link to="/login">Sign in</Link> · <Link to="/orders">My orders</Link></p>}
      {!loading && !cart.length && !error && <p>Your cart is empty.</p>}
      {!!cart.length && <section className="payment-placeholder" style={{ padding: "1.5rem" }}>
        <ul>{cart.map(item => <li key={item.id}>{item.title} — {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</li>)}</ul>
        <p><strong>Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("en-IN")}</strong></p>
        <button className="sign-in" disabled={submitting || cart.some(item => !item.available)} onClick={placeOrder}>{submitting ? "Placing order…" : "Place order"}</button>
        {cart.some(item => !item.available) && <p>Update unavailable items in your cart before ordering.</p>}
      </section>}
    </>}
  </div>;
}
