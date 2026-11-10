export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const CMS_BASE = (import.meta.env.VITE_CMS_URL || "/cms").replace(/\/$/, "");
export const apiUrl = (path) => `${API_BASE}${path}`;
export const cmsUrl = (path) => /^https?:\/\//.test(path) ? path : `${CMS_BASE}${path}`;
export function setCustomer(user) {
  if (user) localStorage.setItem("authUser", JSON.stringify({ id: user._id, name: user.name, email: user.email }));
  else {
    localStorage.removeItem("authUser");
    localStorage.removeItem("cart");
  }
  window.dispatchEvent(new CustomEvent("authStateChanged", { detail: {
    isLoggedIn: Boolean(user), user: user ? { id: user._id, name: user.name, email: user.email } : null,
  } }));
  window.dispatchEvent(new Event("cartUpdated"));
}
export async function apiFetch(path, options = {}) {
  const response = await fetch(apiUrl(path), { ...options, credentials: "include" });
  if (response.status === 401 && !path.startsWith("/api/admin") && path !== "/api/auth/login" && localStorage.getItem("authUser")) setCustomer(null);
  return response;
}
