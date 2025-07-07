const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'editor'],
    default: 'admin'
  },
  
  permissions: [{
    type: String,
    enum: ['products.create', 'products.read', 'products.update', 'products.delete', 
           'orders.read', 'orders.update', 'analytics.read']
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: Date,
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockedUntil: Date
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
adminSchema.methods.isLocked = function() {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
};

module.exports = mongoose.model('Admin', adminSchema);
