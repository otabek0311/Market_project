import express from "express";
import {
  confirmOrder,
  getOrderDetails,
} from "../controller/order-confirmation.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", confirmOrder);

router.get("/:orderId", getOrderDetails);

export default router;
