const asyncHandler = require('express-async-handler');
const CustomOrder = require('../models/CustomOrder');
const { validateCustomOrder } = require('../validators/customOrderValidator');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { calculateEstimatedPrice } = require('../utils/priceCalculator');

// @desc    Create custom order
// @route   POST /api/custom-orders
// @access  Public
const createCustomOrder = asyncHandler(async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateCustomOrder(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Handle design file uploads
    let designFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/pdf', 'image/svg+xml'];
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only JPEG, PNG, PDF, and SVG files are allowed.'
          });
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum 10MB per file.'
          });
        }

        const result = await uploadToCloudinary(file.buffer, {
          folder: 'ssky-custom-orders',
          resource_type: 'auto'
        });
        
        designFiles.push({
          url: result.secure_url,
          publicId: result.public_id,
          filename: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size
        });
      }
    }

    // Calculate estimated price
    const estimatedPrice = calculateEstimatedPrice(value.customSpecs, value.productType);

    const orderData = {
      ...value,
      designFiles,
      estimatedPrice
    };

    const customOrder = await CustomOrder.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Custom order submitted successfully',
      data: {
        orderNumber: customOrder.orderNumber,
        estimatedPrice: customOrder.estimatedPrice,
        status: customOrder.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating custom order',
      error: error.message
    });
  }
});

// @desc    Get all custom orders (Admin)
// @route   GET /api/custom-orders
// @access  Private (Admin)
const getCustomOrders = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  try {
    const skip = (page - 1) * limit;
    
    const orders = await CustomOrder.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip(skip)
      .select('-__v');

    const total = await CustomOrder.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages,
      currentPage: page,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching custom orders',
      error: error.message
    });
  }
});

// @desc    Get single custom order
// @route   GET /api/custom-orders/:id
// @access  Private (Admin) or Public (with order number)
const getCustomOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    // Check if it's an ObjectId or order number
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await CustomOrder.findById(id);
    } else {
      order = await CustomOrder.findOne({ orderNumber: id.toUpperCase() });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching custom order',
      error: error.message
    });
  }
});

// @desc    Update custom order status (Admin)
// @route   PUT /api/custom-orders/:id
// @access  Private (Admin)
const updateCustomOrder = asyncHandler(async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found'
      });
    }

    const allowedUpdates = ['status', 'adminNotes', 'finalQuote', 'priority'];
    const updates = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedOrder = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Custom order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating custom order',
      error: error.message
    });
  }
});

module.exports = {
  createCustomOrder,
  getCustomOrders,
  getCustomOrder,
  updateCustomOrder
};
