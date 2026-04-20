const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/product/:productId', reviewController.getReviews);
router.post(
  '/product/:productId',
  protect,
  reviewController.createRules,
  reviewController.createReview
);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
