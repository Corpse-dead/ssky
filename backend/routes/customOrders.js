const express = require('express');
const router = express.Router();
const {
  createCustomOrder,
  getCustomOrders,
  getCustomOrder,
  updateCustomOrder
} = require('../controllers/customOrderController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.post('/', upload.array('designFiles', 5), createCustomOrder);
router.get('/track/:id', getCustomOrder);

// Protected routes (Admin only)
router.get('/', protect, adminOnly, getCustomOrders);
router.get('/:id', protect, adminOnly, getCustomOrder);
router.put('/:id', protect, adminOnly, updateCustomOrder);

module.exports = router;
