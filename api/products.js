const { MongoClient, ObjectId } = require('mongodb');

// MongoDB Atlas configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/ssky?retryWrites=true&w=majority';
const DB_NAME = 'ssky_printing';
const COLLECTION_NAME = 'products';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    const client = new MongoClient(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await client.connect();
    cachedClient = client;
    return client;
}

// Validation schemas
const validateProduct = (productData) => {
    const errors = [];
    
    if (!productData.productName || productData.productName.trim().length < 2) {
        errors.push('Product name must be at least 2 characters long');
    }
    
    if (!productData.productPrice || isNaN(productData.productPrice) || productData.productPrice <= 0) {
        errors.push('Product price must be a positive number');
    }
    
    if (!productData.productImage || !isValidUrl(productData.productImage)) {
        errors.push('Product image must be a valid URL');
    }
    
    if (!productData.productCategory) {
        errors.push('Product category is required');
    }
    
    return errors;
};

const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

// API Handler
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await connectToDatabase();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        switch (req.method) {
            case 'GET':
                // Get all products
                const products = await collection.find({}).sort({ createdAt: -1 }).toArray();
                res.status(200).json({
                    success: true,
                    data: products
                });
                break;

            case 'POST':
                // Add new product
                const productData = req.body;
                
                // Validate input
                const validationErrors = validateProduct(productData);
                if (validationErrors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Validation failed',
                        details: validationErrors
                    });
                }

                // Prepare product document
                const newProduct = {
                    name: productData.productName.trim(),
                    price: parseFloat(productData.productPrice),
                    image: productData.productImage.trim(),
                    category: productData.productCategory,
                    subcategory: productData.productSubcategory || null,
                    description: productData.productDescription?.trim() || '',
                    badge: productData.productBadge || null,
                    stock: productData.productStock || 'in-stock',
                    amazonLink: productData.amazonLink || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true
                };

                // Insert product
                const result = await collection.insertOne(newProduct);
                
                res.status(201).json({
                    success: true,
                    data: {
                        _id: result.insertedId,
                        ...newProduct
                    }
                });
                break;

            case 'PUT':
                // Update product
                const { id } = req.query;
                const updateData = req.body;
                
                if (!id || !ObjectId.isValid(id)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid product ID'
                    });
                }

                // Validate update data
                const updateValidationErrors = validateProduct(updateData);
                if (updateValidationErrors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Validation failed',
                        details: updateValidationErrors
                    });
                }

                const updatedProduct = {
                    name: updateData.productName.trim(),
                    price: parseFloat(updateData.productPrice),
                    image: updateData.productImage.trim(),
                    category: updateData.productCategory,
                    subcategory: updateData.productSubcategory || null,
                    description: updateData.productDescription?.trim() || '',
                    badge: updateData.productBadge || null,
                    stock: updateData.productStock || 'in-stock',
                    amazonLink: updateData.amazonLink || null,
                    updatedAt: new Date()
                };

                const updateResult = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedProduct }
                );

                if (updateResult.matchedCount === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Product not found'
                    });
                }

                res.status(200).json({
                    success: true,
                    data: { _id: id, ...updatedProduct }
                });
                break;

            case 'DELETE':
                // Delete product
                const { id: deleteId } = req.query;
                
                if (!deleteId || !ObjectId.isValid(deleteId)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid product ID'
                    });
                }

                const deleteResult = await collection.deleteOne({ _id: new ObjectId(deleteId) });
                
                if (deleteResult.deletedCount === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Product not found'
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'Product deleted successfully'
                });
                break;

            default:
                res.status(405).json({
                    success: false,
                    error: 'Method not allowed'
                });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
