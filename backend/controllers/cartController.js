import { Cart } from '../models/cartModel.js';
import { Product } from '../models/productModel.js';

export const addToCart = async (req, res) => {
    try {
        const userId = req.id;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [{
                    productId,
                    quantity,
                    price: product.productPrice
                }]
            });
        } else {
            const itemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    productId,
                    quantity,
                    price: product.productPrice
                });
            }
            await cart.save();
        }

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.id;
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'productName productPrice productImg'
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: { items: [] },
                total: 0
            });
        }

        const total = cart.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        return res.status(200).json({
            success: true,
            cart,
            total
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const userId = req.id;
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const userId = req.id;
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.id;
        await Cart.findOneAndDelete({ userId });

        return res.status(200).json({
            success: true,
            message: "Cart cleared"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};