import express from "express";
import {
  getCheckoutSummary,
  checkout,
  cancelOrder,
} from "../controller/checkout.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/summary", getCheckoutSummary);

router.post("/", checkout);

router.delete("/:orderId", cancelOrder);

export default router;
