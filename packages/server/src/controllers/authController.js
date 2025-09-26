// User authentication controller (no JWT). Users authenticate with username+password.
// Session is kept client-side via localStorage; server identifies requests by userId.
import User from "../model/User.js";
import bcrypt from "bcryptjs";

// Controller that registers a user: validates input, hashes password, saves user
// Learning note: We deliberately do NOT return a JWT for users. We'll use client-side localStorage
// to keep the minimal session state (user profile + cart) and identify requests by userId.
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body; // name is used as username for login
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "user exists" });
    }

    // Hash password using bcrypt before saving
    const salt = await bcrypt.genSalt(5); //number of processing bcrypt does
    const harshedPassword = await bcrypt.hash(password, salt);

    //create user
    const user = await User.create({
      name,
      email,
      password: harshedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      cart: user.cart || [],
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Controller that logs in a user: verifies username/password, returns user profile (no JWT)
// Learning note: Using bcrypt.compare ensures we never store or compare plaintext passwords.
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Find user by username (stored as name)
    const user = await User.findOne({ name: username });
    if (!user) {
      // Return 401 to indicate unauthorized access
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Verify password using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Success: return user profile along with cart; frontend will store in localStorage
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      cart: user.cart || [],
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Update user profile: allow updating username (name) and password only.
// Frontend sends userId, name (optional), password (optional).
export const updateUser = async (req, res) => {
  try {
    const { userId, name, password } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username if provided
    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    // Update password if provided
    if (typeof password === "string" && password.trim()) {
      const salt = await bcrypt.genSalt(5);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    await user.save();

    // Return updated user profile; no password, no JWT
    // Learning note: password hashing happens above when changed; email remains read-only here.
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      cart: user.cart || [],
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};
