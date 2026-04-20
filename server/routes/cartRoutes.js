const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addRules, cartController.addItem);
router.put('/update', cartController.updateRules, cartController.updateQty);
router.delete('/remove/:id', cartController.removeItem);
router.delete('/clear', cartController.clearCart);
router.post('/apply-coupon', cartController.applyCouponRules, cartController.applyCoupon);

module.exports = router;
