import { Link } from "react-router-dom";

// Intentionally keep payment inputs empty for now. A payment provider can be
// added here later; visiting this page must never mark an order as paid.
export default function Payment() {
  return <div className="payment-page">
    <Link className="text-link" to="/cart">← Back to cart</Link>
    <header><span className="eyebrow">Checkout</span><h1>Payment</h1><p>Your payment section will be available here.</p></header>
    {/* Reserved for the future payment integration. Strapi may supply page copy,
        but payment collection and verification belong to the payment provider. */}
    <section className="payment-placeholder" aria-label="Payment section" />
  </div>;
}
