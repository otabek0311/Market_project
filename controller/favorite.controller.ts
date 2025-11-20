import type { Request, Response } from 'express';
import Favorite from '../models/favorite.model.js';
import Product from '../models/product.model.js';

export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.body;
    const user_id = (req as any).user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Avtorizatsiya talab qilinadi'
      });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Mahsulot topilmadi'
      });
    }

    const existingFavorite = await Favorite.findOne({
      where: { user_id, product_id }
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Bu mahsulot allaqachon sevimli ro\'yxatda bor'
      });
    }

    const favorite = await Favorite.create({
      user_id,
      product_id
    });

    res.status(201).json({
      success: true,
      message: 'Mahsulot sevimli ro\'yxatga qo\'shildi',
      data: favorite
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const user_id = (req as any).user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Avtorizatsiya talab qilinadi'
      });
    }

    const result = await Favorite.destroy({
      where: { user_id, product_id }
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sevimli mahsulot topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Mahsulot sevimli ro\'yxatdan o\'chirildi'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Avtorizatsiya talab qilinadi'
      });
    }

    const favorites = await Favorite.findAll({
      where: { user_id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Sevimli mahsulotlar',
      data: favorites
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};
