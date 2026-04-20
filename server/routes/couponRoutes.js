const express = require('express');
const couponController = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.post('/', couponController.createRules, couponController.createCoupon);
router.get('/', couponController.listCoupons);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
