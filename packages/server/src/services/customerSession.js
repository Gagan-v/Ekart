import jwt from "jsonwebtoken";
export const sessionCookie = "ekart_session";
export function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api", maxAge: 7 * 24 * 60 * 60 * 1000 };
}
export function setSession(res, user) {
  const token = jwt.sign({ version: user.sessionVersion || 0 }, process.env.JWT_SECRET, {
    algorithm: "HS256", subject: String(user._id), audience: "ekart-customer", issuer: "ekart", expiresIn: "7d",
  });
  res.cookie(sessionCookie, token, cookieOptions());
}
export function clearSession(res) {
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(sessionCookie, options);
}
export const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email });
