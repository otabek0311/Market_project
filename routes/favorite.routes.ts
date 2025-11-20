import { Router } from 'express';
import { 
  addToFavorites, 
  removeFromFavorites, 
  getUserFavorites 
} from '../controller/favorite.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, addToFavorites);

router.delete('/:product_id', authMiddleware, removeFromFavorites);

router.get('/', authMiddleware, getUserFavorites);

export default router;
