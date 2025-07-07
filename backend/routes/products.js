const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);

// Protected routes (Admin only)
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
        };

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const products = await Product.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-createdBy -__v');

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                hasNext: skip + products.length < total,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// POST /api/products - Create new product (Admin only)
router.post('/', adminAuth, upload.single('image'), validateProduct, async (req, res) => {
    try {
        const productData = {
            ...req.body,
            createdBy: req.user.id
        };

        // Handle image upload
        if (req.file) {
            productData.image = {
                url: req.file.path, // Cloudinary URL
                publicId: req.file.filename,
                alt: req.body.title
            };
        }

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Handle new image upload
        if (req.file) {
            updateData.image = {
                url: req.file.path,
                publicId: req.file.filename,
                alt: req.body.title || 'Product image'
            };
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
});

// POST /api/products/custom-order - Create custom order
router.post('/custom-order', upload.single('image'), validateCustomOrder, async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            customization: {
                ...req.body.customization,
                image: {
                    url: req.file.path,
                    publicId: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size
                }
            }
        };

        const customOrder = new CustomOrder(orderData);
        
        // Calculate pricing
        customOrder.calculatePrice();
        
        await customOrder.save();

        // Add initial timeline entry
        customOrder.timeline.push({
            status: 'pending',
            timestamp: new Date()
        });

        await customOrder.save();

        res.status(201).json({
            success: true,
            message: 'Custom order submitted successfully',
            data: {
                orderId: customOrder._id,
                estimatedPrice: customOrder.pricing.totalPrice,
                status: customOrder.status
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating custom order',
            error: error.message
        });
    }
});

// GET /api/products/custom-orders - Get custom orders (Admin only)
router.get('/custom-orders', adminAuth, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const orders = await CustomOrder.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('timeline.updatedBy', 'name email');

        const total = await CustomOrder.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching custom orders',
            error: error.message
        });
    }
});

// PUT /api/products/custom-orders/:id/status - Update order status (Admin only)
router.put('/custom-orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        
        const order = await CustomOrder.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await order.updateStatus(status, req.user.id);

        // Add admin note if provided
        if (adminNote) {
            order.adminNotes.push({
                note: adminNote,
                addedBy: req.user.id
            });
            await order.save();
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

module.exports = router;
