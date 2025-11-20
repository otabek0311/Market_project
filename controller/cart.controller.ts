import type { Request, Response } from "express";
import { AppError, catchAsync } from "../error/custom-error-hendler.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import type { AddToCartDto, CartResponseDto } from "../dto/cart.dto.js";

Cart.sync({force:false})

export const addToCart = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { product_id, quantity } = req.body as AddToCartDto;

    if (!product_id || !quantity) {
      throw new AppError("product_id va quantity majburiy", 400);
    }

    if (quantity < 1) {
      throw new AppError("Miqdor 1 dan kam bo'lmasligi kerak", 400);
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      throw new AppError("Mahsulot topilmadi", 404);
    }

    let cartItem = await Cart.findOne({
      where: { user_id: userId, product_id },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user_id: userId,
        product_id,
        quantity,
      });
    }

    res.status(201).json({
      message: "Mahsulot savatcha ga qo'shildi",
      data: cartItem,
    });
  }
);

export const getCart = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "image_url"],
        },
      ],
    });

    let total_price = 0;
    cartItems.forEach((item) => {
      const product = item.get("Product") as any;
      total_price += parseFloat(product.price) * item.quantity;
    });

    const response: CartResponseDto = {
      items: cartItems.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: (item.get("Product") as any),
      })),
      total_price,
      total_items: cartItems.length,
    };

    res.status(200).json({
      message: "Savatcha",
      data: response,
    });
  }
);

export const removeFromCart = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { cartItemId } = req.params;

    const cartItem = await Cart.findOne({
      where: { id: cartItemId, user_id: userId },
    });

    if (!cartItem) {
      throw new AppError("Savatcha elementi topilmadi", 404);
    }

    await cartItem.destroy();

    res.status(200).json({
      message: "Mahsulot savatcha dan o'chirildi",
    });
  }
);

export const updateCartQuantity = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      throw new AppError("Miqdor 1 dan kam bo'lmasligi kerak", 400);
    }

    const cartItem = await Cart.findOne({
      where: { id: cartItemId, user_id: userId },
    });

    if (!cartItem) {
      throw new AppError("Savatcha elementi topilmadi", 404);
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      message: "Savatcha yangilandi",
      data: cartItem,
    });
  }
);

export const clearCart = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    await Cart.destroy({
      where: { user_id: userId },
    });

    res.status(200).json({
      message: "Savatcha bo'shashtirildi",
    });
  }
);
