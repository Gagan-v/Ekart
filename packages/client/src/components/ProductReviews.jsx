import { useEffect, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Rating } from "@mui/material";
import { apiFetch } from "../api/config";

export default function ProductReviews({ product, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/api/reviews/product/${product._id}`, { signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not load reviews");
      if (!controller.signal.aborted) setData(result.data);
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [product._id, attempt]);
  return <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="product-reviews-title">
    <DialogTitle id="product-reviews-title">Reviews for {product.title}</DialogTitle>
    <DialogContent dividers>
      {error ? <Alert severity="error">{error} <Button onClick={() => { setError(""); setAttempt(value => value + 1); }}>Retry</Button></Alert> : !data ? <p role="status">Loading reviews…</p> : <>
        <div className="review-summary"><Rating value={data.averageRating} precision={0.1} readOnly /><strong>{data.averageRating.toFixed(1)}/5</strong><span>({data.totalReviews} {data.totalReviews === 1 ? "rating" : "ratings"})</span></div>
        {!data.reviews.length && <p>No reviews yet. After ordering, you can rate this product from My orders.</p>}
        {data.reviews.map(review => <article className="customer-review" key={review._id}>
          <div className="customer-review-heading"><strong>{review.userId?.name || "Customer"}</strong><time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time></div>
          <Rating value={review.rating} readOnly size="small" />
          {review.comment ? <p>{review.comment}</p> : <p className="rating-only">Rated {review.rating}/5 without a comment.</p>}
        </article>)}
      </>}
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
  </Dialog>;
}
