// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productsRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); //link will be /admim/login(/login will come from adminRoutes)

//Product
app.use("/api/admin/products", productRoutes);

//Reviews
app.use("/api/reviews", reviewRoutes);

// User Cart (no JWT; identifies via x-user-id or body)
app.use("/api/cart", cartRoutes);

// DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
