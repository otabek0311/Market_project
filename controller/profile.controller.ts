import type { Request, Response } from "express";
import { AppError, catchAsync } from "../error/custom-error-hendler.js";
import User from "./auth.controller.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import Cancellation from "../models/cancellation.model.js";
import Favorite from "../models/favorite.model.js";
import Product from "../models/product.model.js";
import type {
  UpdateProfileDto,
  ProfileDto,
  OrderDto,
  ReviewDto,
  CancellationDto,
  WishlistDto,
} from "../dto/profile.dto.js";

export const getProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "email", "phone", "profile_image", "createdAt"],
    });

    if (!user) {
      throw new AppError("Foydalanuvchi topilmadi", 404);
    }

    res.status(200).json({
      message: "Profil ma'lumotlari",
      data: user,
    });
  }
);

export const updateProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { username, phone, profile_image } = req.body as UpdateProfileDto;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("Foydalanuvchi topilmadi", 404);
    }

    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (profile_image) user.profile_image = profile_image;

    await user.save();

    res.status(200).json({
      message: "Profil muvaffaqiyatli yangilandi",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
      },
    });
  }
);

export const getMyOrders = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "image_url"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Mening buyurtmalarim",
      data: orders,
      count: orders.length,
    });
  }
);

export const getMyCancellations = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const cancellations = await Cancellation.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "image_url"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Mening bekor qilishlarim",
      data: cancellations,
      count: cancellations.length,
    });
  }
);

export const getMyReviews = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const reviews = await Review.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "image_url"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Mening sharhlarim",
      data: reviews,
      count: reviews.length,
    });
  }
);

export const getMyWishlist = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const favorites = await Favorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "image_url", "category_id"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Mening sevimlilarim",
      data: favorites,
      count: favorites.length,
    });
  }
);

export const createCancellation = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { order_id, product_id, reason } = req.body;

    if (!order_id || !product_id || !reason) {
      throw new AppError("Barcha maydonlar to'ldirilishi kerak", 400);
    }

    const order = await Order.findOne({
      where: { id: order_id, user_id: userId },
    });

    if (!order) {
      throw new AppError("Buyurtma topilmadi", 404);
    }

    const cancellation = await Cancellation.create({
      user_id: userId,
      order_id,
      product_id,
      reason,
    });

    res.status(201).json({
      message: "Bekor qilish so'rovi yaratildi",
      data: cancellation,
    });
  }
);

export const addReview = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      throw new AppError("product_id va rating majburiy", 400);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError("Rating 1 dan 5 gacha bo'lishi kerak", 400);
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      throw new AppError("Mahsulot topilmadi", 404);
    }

    let review = await Review.findOne({
      where: { user_id: userId, product_id },
    });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        user_id: userId,
        product_id,
        rating,
        comment,
      });
    }

    res.status(201).json({
      message: "Sharh qo'shildi",
      data: review,
    });
  }
);

export const logout = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      message: "Muvaffaqiyatli chiqildi",
    });
  }
);
