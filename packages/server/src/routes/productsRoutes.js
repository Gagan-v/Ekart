import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  getProductsCount,
  deleteProduct,
  reduceProductStock,
} from "../controllers/productController.js";
import { adminAuth } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/add-product", adminAuth, createProduct);
router.get("/count", adminAuth, getProductsCount);
router.delete("/:id", adminAuth, deleteProduct);
router.patch("/:id/reduce", adminAuth, reduceProductStock);

export default router;
