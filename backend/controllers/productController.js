import { Product } from '../models/productModel.js';

export const addProduct = async (req, res) => {
    try {
        const { productName, productDesc, productPrice, category, brand } = req.body;
        const userId = req.id;
        if(!productName || !productDesc || !productPrice || !category || !brand) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        //handle multiple image uploads
        let productImg = [];
        if (req.files && req.files.length > 0) {
           for(let file of req.files) {
               const dataUri = getDataUri(file);
               const result = await cloudinary.uploader.upload(dataUri, {
                   folder: "mern_products" //cloudinary folder name
               });
               productImg.push({
                   url: result.secure_url,
                   public_id: result.public_id
               });
           }
        }
        //create a product in DB
        const newProduct = await Product.create({
            userId,
            productName,
            productDesc,
            productPrice,
            category,
            brand,
        productImg //array of objects [{url, public_id}, ...]
        });
        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product : newProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getAllProduct = async (_, res) => {
    try {
        const products = await Product.find();
        if(!products) {
            return res.status(404).json({
                success: false,
                message: "No products found",
                products: []
            });
        }
        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId).populate('userId', 'firstName lastName');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { productName, productDesc, productPrice, category, brand } = req.body;
        const userId = req.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user is product owner or admin
        if (product.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this product"
            });
        }

        let productImg = product.productImg;

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            // Delete old images from cloudinary
            for (let img of product.productImg) {
                await cloudinary.uploader.destroy(img.public_id);
            }

            productImg = [];
            for (let file of req.files) {
                const dataUri = getDataUri(file);
                const result = await cloudinary.uploader.upload(dataUri, {
                    folder: "mern_products"
                });
                productImg.push({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        }

        product.productName = productName || product.productName;
        product.productDesc = productDesc || product.productDesc;
        product.productPrice = productPrice || product.productPrice;
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.productImg = productImg;

        const updatedProduct = await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user is product owner or admin
        if (product.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this product"
            });
        }

        // Delete images from cloudinary
        for (let img of product.productImg) {
            await cloudinary.uploader.destroy(img.public_id);
        }

        await Product.findByIdAndDelete(productId);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const searchProducts = async (req, res) => {
    try {
        const { query, category, brand, minPrice, maxPrice, sortBy } = req.query;

        let filter = {};

        if (query) {
            filter.$or = [
                { productName: { $regex: query, $options: 'i' } },
                { productDesc: { $regex: query, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (brand && brand !== 'All') {
            filter.brand = brand;
        }

        if (minPrice || maxPrice) {
            filter.productPrice = {};
            if (minPrice) filter.productPrice.$gte = Number(minPrice);
            if (maxPrice) filter.productPrice.$lte = Number(maxPrice);
        }

        let sort = {};
        if (sortBy === 'lowToHigh') {
            sort.productPrice = 1;
        } else if (sortBy === 'highToLow') {
            sort.productPrice = -1;
        } else {
            sort.createdAt = -1;
        }

        const products = await Product.find(filter).sort(sort);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
