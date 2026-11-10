import User from "../model/User.js";
import bcrypt from "bcryptjs";
import { setSession, clearSession, publicUser } from "../services/customerSession.js";
const validPassword = (password) => typeof password === "string" && password.length >= 8 && Buffer.byteLength(password) <= 72;
const validName = (name) => typeof name === "string" && name.trim().length >= 2 && name.trim().length <= 80;
function failure(res, error) {
  if (error.code === 11000) return res.status(409).json({ message: "Username or email already exists" });
  if (error.name === "ValidationError") return res.status(400).json({ message: "Invalid account details" });
  return res.status(500).json({ message: "Could not complete account request" });
}
export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body ?? {};
    if (!validName(name) || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim()) || !validPassword(password)) {
      return res.status(400).json({ message: "Enter a username (2–80 characters), valid email, and password (8 characters minimum, 72 bytes maximum)" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ $or: [{ name: name.trim() }, { email: normalizedEmail }] })) return res.status(409).json({ message: "Username or email already exists" });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    return res.status(201).json(publicUser(user));
  } catch (error) { return failure(res, error); }
}
export async function loginUser(req, res) {
  try {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || Buffer.byteLength(password) > 72) return res.status(400).json({ message: "Enter your username and password" });
    const user = await User.findOne({ name: username.trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid credentials" });
    setSession(res, user);
    return res.json(publicUser(user));
  } catch (error) { return failure(res, error); }
}
export async function updateUser(req, res) {
  try {
    const user = req.user;
    const { name, password, currentPassword } = req.body ?? {};
    if (name !== undefined && !validName(name)) return res.status(400).json({ message: "Username must contain 2–80 characters" });
    if (name !== undefined && name.trim() !== user.name && await User.findOne({ name: name.trim(), _id: { $ne: user._id } })) return res.status(409).json({ message: "Username already exists" });
    if (password !== undefined) {
      if (!validPassword(password)) return res.status(400).json({ message: "New password must have at least 8 characters and at most 72 bytes" });
      if (typeof currentPassword !== "string" || !(await bcrypt.compare(currentPassword, user.password))) return res.status(403).json({ message: "Current password is incorrect" });
      user.password = await bcrypt.hash(password, 12);
      user.sessionVersion = (user.sessionVersion || 0) + 1;
    }
    if (name !== undefined) user.name = name.trim();
    await user.save();
    setSession(res, user);
    return res.json(publicUser(user));
  } catch (error) { return failure(res, error); }
}
export const getMe = (req, res) => res.json(publicUser(req.user));
export async function logoutUser(req, res) {
  await User.updateOne({ _id: req.user._id }, { $inc: { sessionVersion: 1 } });
  clearSession(res);
  return res.json({ message: "Signed out" });
}
