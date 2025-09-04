import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "../model/Admin"; // note the .js extension for ESM

dotenv.config();

//connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to DB"))
  .catch((err) => console.error("Admin DB connection error", err));

//create or update admin
(async () => {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 5);
    const admin = await Admin.findOneAndUpdate(
      { username: process.env.ADMIN_USERNAME }, // search by username
      { username: process.env.ADMIN_USERNAME, password: hashedPassword },
      { upsert: true, new: true } //create if not exits
    );
    console.log("Admin created", admin.username);
    process.exit();
  } catch (error) {
    console.error("Error creating admin", error);
    process.exit(1);
  }
})();
