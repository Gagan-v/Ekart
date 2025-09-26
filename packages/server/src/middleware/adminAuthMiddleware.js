// Verifies admin JWT only. Do not use this for user endpoints.
import jwt from "jsonwebtoken";
import Admin from "../model/Admin.js";

export const adminAuth = async (req, res, next) => {
  try {
    // 1. Check if Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }
    // 2.Extract token
    const token = authHeader.split(" ")[1];
    //3.verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //find admin in DB
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Not authorized as admin" });
    }
    //attach admin info
    req.admin = admin;
    next(); // pass control to next handler (controller)
  } catch (error) {
    res.status(401).json({ message: "Token not valid" });
  }
};
