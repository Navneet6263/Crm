const express = require('express');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProductStats,
  createDefaultProducts
} = require('../controllers/productController');

const router = express.Router();

// Product CRUD operations
router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// User stats
router.get('/user-stats', getUserProductStats);

// Create default products
router.post('/create-defaults', createDefaultProducts);

module.exports = router;