const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');

const createRules = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty(),
  body('title').optional().trim(),
];

const createReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existing = await Review.findOne({ user: req.user._id, product: product._id });
  if (existing) {
    res.status(400);
    throw new Error('You already reviewed this product');
  }

  const review = await Review.create({
    user: req.user._id,
    product: product._id,
    rating: Number(req.body.rating),
    title: req.body.title || '',
    comment: req.body.comment,
  });

  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  product.ratings = stats[0] ? Math.round(stats[0].avg * 10) / 10 : review.rating;
  product.numReviews = stats[0]?.count || 1;
  await product.save();

  const populated = await Review.findById(review._id).populate('user', 'name avatar');
  res.status(201).json({ success: true, review: populated });
});

const getReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const total = await Review.countDocuments({ product: product._id });
  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
    reviews,
  });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('product');
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const productId = review.product._id;
  await review.deleteOne();

  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratings: stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0,
    numReviews: stats[0]?.count || 0,
  });

  res.json({ success: true, message: 'Review removed' });
});

module.exports = {
  createReview,
  createRules,
  getReviews,
  deleteReview,
};
