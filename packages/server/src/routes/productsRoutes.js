import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
} from "../controllers/productController.js";
import { adminAuth } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/add-product", adminAuth, createProduct);

export default router;
