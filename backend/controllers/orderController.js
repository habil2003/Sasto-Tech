import { Order } from '../models/orderModel.js';
import { Cart } from '../models/cartModel.js';
import { Product } from '../models/productModel.js';

export const createOrder = async (req, res) => {
    try {
        const userId = req.id;
        const { shippingAddress, paymentMethod } = req.body;

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || 
            !shippingAddress.zipCode || !shippingAddress.phoneNo) {
            return res.status(400).json({
                success: false,
                message: "Complete shipping address is required"
            });
        }

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            productName: item.productId.productName,
            quantity: item.quantity,
            price: item.price
        }));

        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const newOrder = await Order.create({
            userId,
            items: orderItems,
            shippingAddress,
            totalAmount,
            paymentMethod: paymentMethod || 'COD'
        });

        await Cart.findOneAndDelete({ userId });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder._id,
            order: newOrder
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.id;
        const orders = await Order.find({ userId })
            .populate('items.productId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.id;

        const order = await Order.findOne({ _id: orderId, userId })
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'firstName lastName email')
            .populate('items.productId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated",
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.id;

        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel delivered order"
            });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};