import express from "express";
import {
  getProfile,
  updateProfile,
  getMyOrders,
  getMyCancellations,
  getMyReviews,
  getMyWishlist,
  createCancellation,
  addReview,
  logout,
} from "../controller/profile.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProfile);
router.put("/", updateProfile);

router.get("/orders", getMyOrders);

router.get("/cancellations", getMyCancellations);
router.post("/cancellations", createCancellation);

router.get("/reviews", getMyReviews);
router.post("/reviews", addReview);

router.get("/wishlist", getMyWishlist);

router.post("/logout", logout);

export default router;
