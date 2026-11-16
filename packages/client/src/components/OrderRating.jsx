import { useState } from "react";
import { Rating } from "@mui/material";
import { apiFetch } from "../api/config";

export default function OrderRating({ item, review, onRated }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async event => {
    event.preventDefault();
    if (!rating || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await apiFetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId, rating, comment }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save rating");
      onRated(data.data);
    } catch (error) { setError(error.message); }
    finally { setSaving(false); }
  };
  if (review) return <div className="order-rating-saved" role="status"><Rating value={review.rating} readOnly size="small" /> <span>You rated this product {review.rating}/5. Thank you!</span></div>;
  return <form className="order-rating-form" onSubmit={submit}>
    <label>Rate {item.title}</label>
    <Rating name={`rating-${item.productId}`} value={rating} disabled={saving} onChange={(_event, value) => setRating(value || 0)} getLabelText={value => `${value} ${value === 1 ? "star" : "stars"} for ${item.title}`} />
    <textarea aria-label={`Optional review for ${item.title}`} placeholder="Tell us what you think (optional)" maxLength={500} rows={2} value={comment} disabled={saving} onChange={event => setComment(event.target.value)} />
    <button className="checkout-button" type="submit" disabled={!rating || saving}>{saving ? "Saving…" : "Submit rating"}</button>
    {error && <p role="alert">{error}</p>}
  </form>;
}
