import { Router } from 'express';
import {
  getTopSellingProducts,
  getTopSellingProductsWithLimit,
  getAllProducts,
  getProductById,
  exploreProducts,
  searchProducts
} from '../controller/product.controller.js';

const router = Router();

router.get('/search', searchProducts);

router.get('/explore', exploreProducts);

router.get('/top-selling', getTopSellingProducts);

router.get('/top-selling-limit', getTopSellingProductsWithLimit);

router.get('/', getAllProducts);

router.get('/:id', getProductById);

export default router;
