const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Coupon = require('../models/Coupon');

const createRules = [
  body('code').trim().notEmpty(),
  body('discountType').isIn(['percent', 'fixed']),
  body('discountValue').isFloat({ min: 0 }),
  body('expiresAt').isISO8601(),
];

const createCoupon = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const code = req.body.code.toUpperCase();
  const exists = await Coupon.findOne({ code });
  if (exists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code,
    discountType: req.body.discountType,
    discountValue: Number(req.body.discountValue),
    minOrderAmount: Number(req.body.minOrderAmount) || 0,
    maxUsage: Number(req.body.maxUsage) || 100,
    expiresAt: new Date(req.body.expiresAt),
    isActive: req.body.isActive !== false,
  });

  res.status(201).json({ success: true, coupon });
});

const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = {
  createCoupon,
  createRules,
  listCoupons,
  deleteCoupon,
};
