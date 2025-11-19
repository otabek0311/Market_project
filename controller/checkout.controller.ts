import type { Request, Response } from "express";
import { AppError, catchAsync } from "../error/custom-error-hendler.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import type { CheckoutRequestDto, CheckoutResponseDto, CartDetailDto } from "../dto/checkout.dto.js";

export const getCheckoutSummary = catchAsync(
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

    if (cartItems.length === 0) {
      throw new AppError("Savatcha bo'sh", 400);
    }

    let total_price = 0;
    const items = cartItems.map((item) => {
      const product = item.get("Product") as any;
      const subtotal = parseFloat(product.price) * item.quantity;
      total_price += subtotal;

      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        },
        subtotal,
      };
    });

    const response: CartDetailDto = {
      items,
      total_items: cartItems.length,
      total_price,
    };

    res.status(200).json({
      message: "Checkout ma'lumotlari",
      data: response,
    });
  }
);

export const checkout = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { shipping_address, payment_method } = req.body as CheckoutRequestDto;

    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "stock_quantity"],
        },
      ],
    });

    if (cartItems.length === 0) {
      throw new AppError("Savatcha bo'sh", 400);
    }

    for (const cartItem of cartItems) {
      const product = cartItem.get("Product") as any;
      if (product.stock_quantity < cartItem.quantity) {
        throw new AppError(
          `${product.name} uchun yetarli stock yo'q. Mavjud: ${product.stock_quantity}, Talab: ${cartItem.quantity}`,
          400
        );
      }
    }

    const orders = [];
    let total_price = 0;

    for (const cartItem of cartItems) {
      const product = cartItem.get("Product") as any;
      const subtotal = parseFloat(product.price) * cartItem.quantity;
      total_price += subtotal;

      const order = await Order.create({
        user_id: userId,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        total_price: subtotal,
        status: "pending",
      });

      orders.push(order);
    }

    await Cart.destroy({
      where: { user_id: userId },
    });

    const cartItems_with_products = await Order.findAll({
      where: { user_id: userId, id: orders.map((o) => o.id) },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "image_url"],
        },
      ],
    });

    const items = cartItems_with_products.map((order) => {
      const product = order.get("Product") as any;
      return {
        id: order.id,
        product_id: order.product_id,
        quantity: order.quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        },
        subtotal: parseFloat(order.total_price.toString()),
      };
    });

    const response: CheckoutResponseDto = {
      message: "Buyurtma muvaffaqiyatli rasmiylantirildi",
      order_details: {
        items,
        total_items: orders.length,
        total_price,
        orders_created: orders.length,
      },
    };

    res.status(201).json(response);
  }
);

export const cancelOrder = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new AppError("Buyurtma topilmadi", 404);
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      throw new AppError("Bu buyurtmani bekor qilib bo'lmaydi", 400);
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      message: "Buyurtma bekor qilindi",
      data: order,
    });
  }
);
