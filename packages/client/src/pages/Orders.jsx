import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/config";

export function OrderDetails({ order }) {
  return <article className="payment-placeholder" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
    <h2>Order #{order._id}</h2>
    <p><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString()}</time></p>
    <p>Order placed · Payment pending</p>
    <ul>{order.items.map(item => <li key={item.productId}>{item.title} — {item.quantity} × ₹{item.price.toLocaleString("en-IN")} = ₹{(item.price * item.quantity).toLocaleString("en-IN")}</li>)}</ul>
    <p><strong>Total: ₹{order.total.toLocaleString("en-IN")}</strong></p>
  </article>;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiFetch("/api/orders").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load orders");
      if (active) setOrders(data.orders);
    }).catch(error => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <div className="payment-page"><h1>My orders</h1>
    {loading && <p>Loading orders…</p>}
    {error && <p role="alert">{error} <Link to="/login">Sign in</Link></p>}
    {!loading && !error && !orders.length && <p>You haven’t placed any orders yet. <Link to="/products">Browse products</Link></p>}
    {orders.map(order => <OrderDetails key={order._id} order={order} />)}
  </div>;
}
