import User from "../model/User.js";

// Session-less identification: attach user by ID passed via header x-user-id (sent by frontend)
// Learning note: This replaces JWT for user endpoints. Admin remains protected by adminAuth middleware.
export const attachUserById = async (req, res, next) => {
  try {
    const userId = req.header("x-user-id") || req.body?.userId;
    if (!userId) {
      return res.status(401).json({ message: "No userId provided" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user; // keep password on instance for internal ops; never send it back
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid user" });
  }
};
