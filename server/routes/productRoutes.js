const express = require('express');
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/featured', productController.getFeatured);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post(
  '/',
  protect,
  adminOnly,
  upload.array('images', 8),
  productController.createRules,
  productController.createProduct
);
router.put(
  '/:id',
  protect,
  adminOnly,
  upload.array('images', 8),
  productController.updateRules,
  productController.updateProduct
);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;
