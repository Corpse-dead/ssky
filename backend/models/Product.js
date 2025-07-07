const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ['gaming', 'tech', 'nature', 'vintage', 'abstract', 'custom'],
      message: 'Category must be one of: gaming, tech, nature, vintage, abstract, custom'
    },
    index: true
  },
  
  productType: {
    type: String,
    required: [true, 'Product type is required'],
    enum: {
      values: ['poster', 'sticker', 'banner', 'card'],
      message: 'Product type must be one of: poster, sticker, banner, card'
    },
    index: true
  },
  
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [1, 'Price must be at least ₹1'],
    max: [100000, 'Price cannot exceed ₹100,000']
  },
  
  originalPrice: {
    type: Number,
    validate: {
      validator: function(v) {
        return !v || v >= this.price;
      },
      message: 'Original price must be greater than or equal to current price'
    }
  },
  
  images: [{
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Image public ID is required']
    },
    alt: {
      type: String,
      default: function() {
        return this.title;
      }
    }
  }],
  
  specifications: {
    size: {
      type: String,
      required: [true, 'Size specification is required']
    },
    material: {
      type: String,
      required: [true, 'Material specification is required']
    },
    finish: {
      type: String,
      enum: ['matte', 'glossy', 'satin', 'vinyl'],
      default: 'matte'
    },
    waterproof: {
      type: Boolean,
      default: true
    },
    customizable: {
      type: Boolean,
      default: true
    }
  },
  
  badge: {
    type: String,
    enum: ['new', 'trending', 'bestseller', 'sale'],
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  stock: {
    type: Number,
    default: 999,
    min: [0, 'Stock cannot be negative']
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  orders: {
    type: Number,
    default: 0
  },
  
  seoMetadata: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Indexes for performance
productSchema.index({ category: 1, productType: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware
productSchema.pre('save', function(next) {
  if (!this.seoMetadata.metaTitle) {
    this.seoMetadata.metaTitle = this.title;
  }
  if (!this.seoMetadata.metaDescription) {
    this.seoMetadata.metaDescription = this.description.substring(0, 150);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
