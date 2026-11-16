import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrderRating from "../components/OrderRating";
import { apiFetch } from "../api/config";

export function OrderDetails({ order, reviews, onRated }) {
  return <article className="payment-placeholder" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
    <h2>Order #{order._id}</h2>
    <p><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString()}</time></p>
    <p>Order placed · Payment pending</p>
    <ul>{order.items.map(item => <li key={item.productId}>{item.title} — {item.quantity} × ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${(item.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{reviews && <OrderRating item={item} review={reviews[item.productId]} onRated={onRated} />}</li>)}</ul>
    <p><strong>Total: ${order.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
  </article>;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState({});
  const onRated = review => setReviews(previous => ({ ...previous, [review.productId]: review }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([apiFetch("/api/orders"), apiFetch("/api/reviews/mine")]).then(async responses => {
      const [orderData, reviewData] = await Promise.all(responses.map(response => response.json()));
      if (!responses[0].ok) throw new Error(orderData.message || "Could not load orders");
      if (!responses[1].ok) throw new Error(reviewData.message || "Could not load ratings");
      if (active) {
        setOrders(orderData.orders);
        setReviews(Object.fromEntries(reviewData.reviews.map(review => [review.productId, review])));
      }
    }).catch(error => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <div className="payment-page"><h1>My orders</h1>
    {loading && <p>Loading orders…</p>}
    {error && <p role="alert">{error} <Link to="/login">Sign in</Link></p>}
    {!loading && !error && !orders.length && <p>You haven’t placed any orders yet. <Link to="/products">Browse products</Link></p>}
    {orders.map(order => <OrderDetails key={order._id} order={order} reviews={reviews} onRated={onRated} />)}
  </div>;
}
