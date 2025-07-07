const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    }
  },
  
  productType: {
    type: String,
    required: [true, 'Product type is required'],
    enum: {
      values: ['sticker', 'poster', 'banner', 'card'],
      message: 'Product type must be one of: sticker, poster, banner, card'
    }
  },
  
  customSpecs: {
    size: {
      width: {
        type: Number,
        required: [true, 'Width is required'],
        min: [1, 'Width must be at least 1 inch']
      },
      height: {
        type: Number,
        required: [true, 'Height is required'],
        min: [1, 'Height must be at least 1 inch']
      },
      unit: {
        type: String,
        enum: ['inches', 'cm', 'mm'],
        default: 'inches'
      }
    },
    
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [10000, 'Quantity cannot exceed 10,000']
    },
    
    material: {
      type: String,
      enum: ['vinyl', 'paper', 'fabric', 'transparent', 'holographic'],
      default: 'vinyl'
    },
    
    finish: {
      type: String,
      enum: ['matte', 'glossy', 'satin'],
      default: 'matte'
    },
    
    shape: {
      type: String,
      enum: ['rectangle', 'circle', 'square', 'custom'],
      default: 'rectangle'
    }
  },
  
  designFiles: [{
    url: {
      type: String,
      required: [true, 'Design file URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Design file public ID is required']
    },
    filename: {
      type: String,
      required: [true, 'Filename is required']
    },
    fileType: {
      type: String,
      required: [true, 'File type is required']
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required']
    }
  }],
  
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  
  estimatedPrice: {
    type: Number,
    required: [true, 'Estimated price is required'],
    min: [1, 'Price must be at least ₹1']
  },
  
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'quoted', 'approved', 'in_production', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  
  finalQuote: {
    amount: Number,
    breakdown: {
      designCost: Number,
      materialCost: Number,
      printingCost: Number,
      shippingCost: Number
    },
    validUntil: Date
  },
  
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate order number
customOrderSchema.pre('save', function(next) {
  if (!this.orderNumber && this.isNew) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.orderNumber = `CO-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Indexes
customOrderSchema.index({ status: 1, createdAt: -1 });
customOrderSchema.index({ 'customerInfo.email': 1 });
customOrderSchema.index({ orderNumber: 1 });
customOrderSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model('CustomOrder', customOrderSchema);
