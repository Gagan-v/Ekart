// Admin authentication controller
// Uses JWT exclusively for admins. Users do NOT use JWT anywhere in this codebase.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../model/Admin.js";

dotenv.config();

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    //check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ messgae: "Invalid credentials" });
    }
    //check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong passowrd" });
    }
    //genrate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ message: "Admin Login Sucessful", token });
  } catch (err) {
    console.error("ADmin login error", err);
    res.status(500).json({ message: "Server error" });
  }
};
