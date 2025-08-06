const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  addVariant,
  getProductsByCategory,
  getFeaturedProducts,
  getRelatedProducts,
  getDiscountedProducts,
  getLowStockProducts,
  bulkUpdateProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/on-sale', getDiscountedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);

// Protected routes (require authentication)
router.use(protect);

// Regular user routes
router.post('/',  createProduct);
router.put('/:id',  updateProduct);
router.delete('/:id',  deleteProduct);
router.put('/:id/inventory',  updateInventory);
router.post('/:id/variants',  addVariant);

// Admin-only routes
router.get('/low-stock',  getLowStockProducts);
router.put('/bulk-update', bulkUpdateProducts);

module.exports = router;