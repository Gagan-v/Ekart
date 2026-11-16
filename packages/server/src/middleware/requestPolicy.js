export function allowedOrigins() {
  return (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean);
}
export function checkOrigin(req, res, next) {
  const origin = req.get("origin");
  if (origin && !allowedOrigins().includes(origin)) return res.status(403).json({ message: "Origin is not allowed" });
  next();
}
// In-memory login throttling for a single API process. Use a shared limiter when scaling.
export function authLimiter({ limit = 30, windowMs = 15 * 60 * 1000 } = {}) {
  const attempts = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [ip, entry] of attempts) if (entry.until <= now) attempts.delete(ip);
    const key = req.ip;
    const entry = attempts.get(key) || { count: 0, until: now + windowMs };
    attempts.set(key, entry);
    entry.count++;
    if (entry.count > limit) {
      res.set("Retry-After", String(Math.ceil((entry.until - now) / 1000)));
      return res.status(429).json({ message: "Too many attempts. Please try again later." });
    }
    next();
  };
}
