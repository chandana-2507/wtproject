const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_COOKIE,
} = require('../utils/generateToken');

async function mergeGuestCart(userId, guestCartItems) {
  if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) return;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  for (const line of guestCartItems) {
    const pid = line.product || line.productId || line._id;
    const qty = Math.max(1, Number(line.qty) || 1);
    if (!pid) continue;

    const product = await Product.findById(pid);
    if (!product) continue;

    const idx = cart.items.findIndex((i) => i.product.toString() === product._id.toString());
    if (idx >= 0) {
      cart.items[idx].qty += qty;
      cart.items[idx].price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        qty,
        price: product.price,
      });
    }
  }

  await cart.save();
}

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshStr = generateRefreshToken(user._id);
  setAuthCookies(res, accessToken, refreshStr);

  await mergeGuestCart(user._id, req.body.guestCartItems);

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshStr = generateRefreshToken(user._id);
  setAuthCookies(res, accessToken, refreshStr);

  await mergeGuestCart(user._id, req.body.guestCartItems);

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out' });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'name price images ratings slug',
  });
  res.json({ success: true, user });
});

const updateProfileRules = [body('name').optional().trim().notEmpty()];

const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const user = await User.findById(req.user._id);
  if (req.body.name) user.name = req.body.name;

  if (req.file?.path) {
    if (user.avatar?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (e) {
        /* ignore */
      }
    }
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'ecommerce/avatars' });
    fs.unlink(req.file.path, () => {});
    user.avatar = { url: result.secure_url, public_id: result.public_id };
  }

  await user.save();
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
    },
  });
});

const changePasswordRules = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
];

const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});

const refreshToken = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (!raw) {
    res.status(401);
    throw new Error('No refresh token');
  }

  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  let decoded;
  try {
    decoded = jwt.verify(raw, secret);
  } catch {
    clearAuthCookies(res);
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    clearAuthCookies(res);
    res.status(401);
    throw new Error('User not found');
  }

  const accessToken = generateAccessToken(user._id);
  const newRefresh = generateRefreshToken(user._id);
  setAuthCookies(res, accessToken, newRefresh);
  res.json({ success: true });
});

const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, addresses: user.addresses || [] });
});

const addressRules = [
  body('fullName').trim().notEmpty(),
  body('phone').trim().notEmpty(),
  body('street').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('postalCode').trim().notEmpty(),
  body('country').trim().notEmpty(),
];

const addAddress = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const user = await User.findById(req.user._id);
  const payload = {
    label: req.body.label || 'Home',
    fullName: req.body.fullName,
    phone: req.body.phone,
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    postalCode: req.body.postalCode,
    country: req.body.country,
    isDefault: !!req.body.isDefault,
  };

  if (payload.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  user.addresses.push(payload);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

const updateAddress = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) {
    res.status(404);
    throw new Error('Address not found');
  }

  Object.assign(addr, {
    label: req.body.label ?? addr.label,
    fullName: req.body.fullName ?? addr.fullName,
    phone: req.body.phone ?? addr.phone,
    street: req.body.street ?? addr.street,
    city: req.body.city ?? addr.city,
    state: req.body.state ?? addr.state,
    postalCode: req.body.postalCode ?? addr.postalCode,
    country: req.body.country ?? addr.country,
  });

  if (req.body.isDefault === true) {
    user.addresses.forEach((a) => {
      a.isDefault = a._id.equals(addr._id);
    });
  }

  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    model: 'Product',
  });
  res.json({ success: true, wishlist: user.wishlist });
});

const toggleWishlistRules = [body('productId').notEmpty()];

const toggleWishlist = asyncHandler(async (req, res) => {
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

  const user = await User.findById(req.user._id);
  const idx = user.wishlist.findIndex((id) => id.toString() === product._id.toString());
  if (idx >= 0) user.wishlist.splice(idx, 1);
  else user.wishlist.push(product._id);

  await user.save();
  const populated = await User.findById(user._id).populate('wishlist');
  res.json({ success: true, wishlist: populated.wishlist });
});

module.exports = {
  register,
  registerRules,
  login,
  loginRules,
  logout,
  getMe,
  updateProfileRules,
  updateProfile,
  changePasswordRules,
  changePassword,
  refreshToken,
  getAddresses,
  addressRules,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlistRules,
  toggleWishlist,
};
