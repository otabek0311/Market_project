import { Router } from 'express';
import { 
  addToFavorites, 
  removeFromFavorites, 
  getUserFavorites 
} from '../controller/favorite.controller.js';

const router = Router();

router.post('/', addToFavorites);

router.delete('/:product_id', removeFromFavorites);

router.get('/', getUserFavorites);

export default router;
