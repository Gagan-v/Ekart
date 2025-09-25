import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Controller that registers a user: validates input, hashes password, saves user, returns JWT
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
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

    // Generate token for immediate authentication after registration
    // sign creates token,process.env.JWT_SECRET is key
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", //token validity
    });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Controller that logs in a user: verifies email/password and returns JWT
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Verify password using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Generate JWT token for authenticated sessions
    const token = jwt.sign(
      { id: user._id }, //payload (data u want inside)
      process.env.JWT_SECRET, //secret
      { expiresIn: "7d" } //options
    );
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};
