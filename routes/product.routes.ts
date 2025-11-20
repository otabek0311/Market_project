import { Router } from 'express';
import {
  getTopSellingProducts,
  getTopSellingProductsWithLimit,
  getAllProducts,
  getProductById,
  exploreProducts,
  searchProducts,
  createProduct,
  createCategory
} from '../controller/product.controller.js';

const router = Router();

router.post('/create', createProduct);

router.post('/category/create', createCategory);

router.get('/search', searchProducts);

router.get('/explore', exploreProducts);

router.get('/top-selling', getTopSellingProducts);

router.get('/top-selling-limit', getTopSellingProductsWithLimit);

router.get('/', getAllProducts);

router.get('/:id', getProductById);

export default router;
