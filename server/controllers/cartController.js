const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

function roundMoney(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    model: 'Product',
  });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      model: 'Product',
    });
  }
  return cart;
};

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ success: true, cart });
});

const addRules = [
  body('productId').notEmpty(),
  body('qty').optional().isInt({ min: 1 }),
];

const addItem = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const product = await Product.findById(req.body.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const qty = Math.max(1, Number(req.body.qty) || 1);
  if (product.stock < qty) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const idx = cart.items.findIndex((i) => i.product.toString() === product._id.toString());
  if (idx >= 0) {
    const newQty = cart.items[idx].qty + qty;
    if (newQty > product.stock) {
      res.status(400);
      throw new Error('Insufficient stock');
    }
    cart.items[idx].qty = newQty;
    cart.items[idx].price = product.price;
  } else {
    cart.items.push({ product: product._id, qty, price: product.price });
  }

  await cart.save();
  const populated = await Cart.findById(cart._id).populate('items.product');
  res.json({ success: true, cart: populated });
});

const updateRules = [
  body('productId').notEmpty(),
  body('qty').isInt({ min: 1 }),
];

const updateQty = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const product = await Product.findById(req.body.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const qty = Number(req.body.qty);
  if (qty > product.stock) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const line = cart.items.find((i) => i.product.toString() === product._id.toString());
  if (!line) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  line.qty = qty;
  line.price = product.price;
  await cart.save();

  const populated = await Cart.findById(cart._id).populate('items.product');
  res.json({ success: true, cart: populated });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.id);
  await cart.save();

  const populated = await Cart.findById(cart._id).populate('items.product');
  res.json({ success: true, cart: populated });
});

const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.couponApplied = { code: '', discountType: '', discountValue: 0 };
    cart.discount = 0;
    await cart.save();
  }
  const populated = cart ? await Cart.findById(cart._id).populate('items.product') : { items: [] };
  res.json({ success: true, cart: populated });
});

const applyCouponRules = [body('code').trim().notEmpty()];

const applyCoupon = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const cart = await getOrCreateCart(req.user._id);
  if (!cart.items.length) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const code = req.body.code.toUpperCase();
  const coupon = await Coupon.findOne({ code, isActive: true });
  if (!coupon) {
    res.status(400);
    throw new Error('Invalid coupon');
  }
  if (coupon.expiresAt < new Date()) {
    res.status(400);
    throw new Error('Coupon expired');
  }
  if (coupon.usedCount >= coupon.maxUsage) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  const itemsTotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (itemsTotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount is ${coupon.minOrderAmount}`);
  }

  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = roundMoney((itemsTotal * coupon.discountValue) / 100);
  } else {
    discount = roundMoney(Math.min(coupon.discountValue, itemsTotal));
  }

  cart.couponApplied = {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  };
  cart.discount = discount;
  await cart.save();

  const populated = await Cart.findById(cart._id).populate('items.product');
  res.json({ success: true, cart: populated });
});

module.exports = {
  getCart,
  addItem,
  addRules,
  updateQty,
  updateRules,
  removeItem,
  clearCart,
  applyCoupon,
  applyCouponRules,
};
