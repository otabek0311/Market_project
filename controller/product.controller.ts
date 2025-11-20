import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';

Product.sync({force: false})

export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['sold_count', 'DESC']],
      attributes: ['id', 'name', 'description', 'price', 'image_url', 'sold_count', 'stock_quantity', 'category_id']
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getTopSellingProductsWithLimit = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const products = await Product.findAll({
      where: { is_active: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['sold_count', 'DESC']],
      limit,
      attributes: ['id', 'name', 'description', 'price', 'image_url', 'sold_count', 'stock_quantity', 'category_id']
    });

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'name', 'description', 'price', 'image_url', 'sold_count', 'stock_quantity', 'category_id']
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'name', 'description', 'price', 'image_url', 'sold_count', 'stock_quantity', 'category_id']
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const exploreProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: { is_active: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'name', 'description', 'price', 'image_url', 'sold_count', 'stock_quantity', 'category_id']
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Qidiruv so\'zi majburiy'
      });
    }

    const products = await Product.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${query}%`
            }
          },
          {
            description: {
              [Op.iLike]: `%${query}%`
            }
          }
        ]
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'name', 'description', 'price', 'image_url', 'sold_count', 'stock_quantity', 'category_id']
    });

    res.json({
      success: true,
      data: products,
      count: products.length,
      query
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock_quantity, image_url, category_id } = req.body;

    // Majburiy maydonlarni tekshirish
    if (!name || !description || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Majburiy maydonlar: name, description, price, category_id'
      });
    }

    // Kategoriya mavjudligini tekshirish
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoriya topilmadi'
      });
    }

    // Mahsulot yaratish
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      stock_quantity: stock_quantity || 0,
      image_url: image_url || null,
      category_id,
      is_active: true,
      sold_count: 0
    });

    res.status(201).json({
      success: true,
      message: 'Mahsulot muvaffaqiyatli qo\'shildi',
      data: product
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image_url } = req.body;

    // Kategoriya nomi tekshirish
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Kategoriya nomi majburiy'
      });
    }

    // Kategoriya yaratish
    const category = await Category.create({
      name,
      description: description || null,
      image_url: image_url || null
    });

    res.status(201).json({
      success: true,
      message: 'Kategoriya muvaffaqiyatli qo\'shildi',
      data: category
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};
