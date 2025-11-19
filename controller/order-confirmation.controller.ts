import type { Request, Response } from "express";
import { AppError, catchAsync } from "../error/custom-error-hendler.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import type { OrderConfirmationRequestDto, OrderConfirmationResponseDto } from "../dto/order-confirmation.dto.js";

export const confirmOrder = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { shipping_details, payment_method } = req.body as OrderConfirmationRequestDto;

    if (!shipping_details || !payment_method) {
      throw new AppError("Tolov tafsilotlari va tolov turi majburiy", 400);
    }

    const { full_name, phone_number, street_address, city, postal_code } = shipping_details;

    if (!full_name || !phone_number || !street_address || !city || !postal_code) {
      throw new AppError("Barcha tolov tafsilotlari to'ldirilishi kerak", 400);
    }

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
    const order_items = [];

    for (const cartItem of cartItems) {
      const product = cartItem.get("Product") as any;
      const subtotal = parseFloat(product.price) * cartItem.quantity;
      total_price += subtotal;

      const order = await Order.create({
        user_id: userId,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        total_price: subtotal,
        status: "confirmed",
        full_name,
        phone_number,
        street_address,
        city,
        postal_code,
        payment_method,
      });

      await Product.update(
        { stock_quantity: product.stock_quantity - cartItem.quantity },
        { where: { id: cartItem.product_id } }
      );

      orders.push(order);
      order_items.push({
        product_id: cartItem.product_id,
        product_name: product.name,
        quantity: cartItem.quantity,
        price: parseFloat(product.price),
        subtotal,
      });
    }

    await Cart.destroy({
      where: { user_id: userId },
    });

    const firstOrder = orders[0];
    if (!firstOrder) {
      throw new AppError("Buyurtma yaratishda xatolik", 500);
    }

    const response: OrderConfirmationResponseDto = {
      message: "Buyurtma muvaffaqiyatli rasmiylantirildi",
      order_summary: {
        order_id: firstOrder.id,
        items: order_items,
        total_price,
        shipping_details: {
          full_name,
          phone_number,
          street_address,
          city,
          postal_code,
        },
        payment_method,
        status: "confirmed",
        createdAt: firstOrder.createdAt,
      },
    };

    res.status(201).json(response);
  }
);

export const getOrderDetails = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError("Foydalanuvchi topilmadi", 401);
    }

    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "image_url"],
        },
      ],
    });

    if (!order) {
      throw new AppError("Buyurtma topilmadi", 404);
    }

    const product = order.get("Product") as any;

    res.status(200).json({
      message: "Buyurtma tafsilotlari",
      data: {
        order_id: order.id,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        },
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        shipping_details: {
          full_name: order.full_name,
          phone_number: order.phone_number,
          street_address: order.street_address,
          city: order.city,
          postal_code: order.postal_code,
        },
        payment_method: order.payment_method,
        createdAt: order.createdAt,
      },
    });
  }
);
