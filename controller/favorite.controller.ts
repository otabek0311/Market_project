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
        message: 'Unauthorized'
      });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const existingFavorite = await Favorite.findOne({
      where: { user_id, product_id }
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Product already in favorites'
      });
    }

    const favorite = await Favorite.create({
      user_id,
      product_id
    });

    res.status(201).json({
      success: true,
      message: 'Product added to favorites',
      data: favorite
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'Unauthorized'
      });
    }

    const result = await Favorite.destroy({
      where: { user_id, product_id }
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Product removed from favorites'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'Unauthorized'
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
      data: favorites
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
