const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const updateOrderRules = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
];

const getAdminOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter).populate('user', 'name email').sort('-createdAt');
  res.json({ success: true, orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = req.body.status;
  if (req.body.status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  await order.save();

  const populated = await Order.findById(order._id).populate('user', 'name email');
  res.json({ success: true, order: populated });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ success: true, users });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete admin user');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

const updateUserRoleRules = [body('role').isIn(['user', 'admin'])];

const updateUserRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = req.body.role;
  await user.save();

  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

const getStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const revenueAgg = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
  ]);
  const totalRevenue = revenueAgg[0]?.revenue || 0;

  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(8);

  res.json({
    success: true,
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    revenueByMonth,
    recentOrders,
  });
});

module.exports = {
  getAdminOrders,
  updateOrderStatus,
  updateOrderRules,
  getUsers,
  deleteUser,
  updateUserRole,
  updateUserRoleRules,
  getStats,
};
