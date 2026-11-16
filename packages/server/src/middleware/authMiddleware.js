import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { sessionCookie, clearSession } from "../services/customerSession.js";
export async function customerAuth(req, res, next) {
  try {
    const token = req.cookies?.[sessionCookie];
    if (!token) return res.status(401).json({ message: "Please sign in" });
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], audience: "ekart-customer", issuer: "ekart" });
    const user = await User.findById(payload.sub);
    if (!user || payload.version !== (user.sessionVersion || 0)) throw new Error("Session expired");
    req.user = user;
    return next();
  } catch {
    clearSession(res);
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}
