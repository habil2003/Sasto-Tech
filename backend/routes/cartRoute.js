import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', isAuthenticated, addToCart);
router.get('/get', isAuthenticated, getCart);
router.put('/update', isAuthenticated, updateCartItem);
router.delete('/remove/:productId', isAuthenticated, removeFromCart);
router.delete('/clear', isAuthenticated, clearCart);

export default router;