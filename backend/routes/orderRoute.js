import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/isAuthenticated.js';
import { 
    createOrder, 
    getUserOrders, 
    getOrderById, 
    getAllOrders, 
    updateOrderStatus,
    cancelOrder 
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/create', isAuthenticated, createOrder);
router.get('/user-orders', isAuthenticated, getUserOrders);
router.get('/order/:orderId', isAuthenticated, getOrderById);
router.get('/all-orders', isAuthenticated, isAdmin, getAllOrders);
router.put('/update-status/:orderId', isAuthenticated, isAdmin, updateOrderStatus);
router.put('/cancel/:orderId', isAuthenticated, cancelOrder);

export default router;