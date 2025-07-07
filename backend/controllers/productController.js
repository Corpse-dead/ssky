const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { validateProduct, validateProductUpdate } = require('../validators/productValidator');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    productType = 'sticker',
    page = 1,
    limit = 12,
    sort = '-createdAt',
    search,
    featured,
    minPrice,
    maxPrice
  } = req.query;

  // Build filter object
  const filter = { 
    isActive: true,
    productType: productType 
  };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (featured === 'true') {
    filter.featured = true;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Search functionality
  if (search) {
    filter.$text = { $search: search };
  }

  try {
    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip(skip)
      .select('-__v');

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: page,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.status(200).json({
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

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = asyncHandler(async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Handle image uploads if files are provided
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'ssky-products',
          transformation: [
            { width: 800, height: 800, crop: 'fill', quality: 'auto' }
          ]
        });
        
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          alt: value.title
        });
      }
    }

    const productData = {
      ...value,
      images: images.length > 0 ? images : value.images
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate input
    const { error, value } = validateProductUpdate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from cloudinary
      for (const image of product.images) {
        await deleteFromCloudinary(image.publicId);
      }

      // Upload new images
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'ssky-products',
          transformation: [
            { width: 800, height: 800, crop: 'fill', quality: 'auto' }
          ]
        });
        
        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          alt: value.title || product.title
        });
      }
      value.images = newImages;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from cloudinary
    for (const image of product.images) {
      await deleteFromCloudinary(image.publicId);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
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

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { productType = 'sticker', limit = 12 } = req.query;

  try {
    const products = await Product.find({
      category,
      productType,
      isActive: true
    })
    .sort('-createdAt')
    .limit(limit * 1)
    .select('-__v');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
};
