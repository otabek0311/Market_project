import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../controller/cart.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/add", addToCart);

router.get("/", getCart);

router.delete("/:cartItemId", removeFromCart);

router.put("/:cartItemId", updateCartQuantity);

router.delete("/", clearCart);

export default router;
