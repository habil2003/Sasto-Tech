import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        phoneNo: { type: String, required: true }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online', 'Card'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    }
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);