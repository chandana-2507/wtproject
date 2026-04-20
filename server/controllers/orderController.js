const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/sendEmail');

function roundMoney(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const createOrderRules = [
  body('shippingAddress.fullName').trim().notEmpty(),
  body('shippingAddress.phone').trim().notEmpty(),
  body('shippingAddress.street').trim().notEmpty(),
  body('shippingAddress.city').trim().notEmpty(),
  body('shippingAddress.state').trim().notEmpty(),
  body('shippingAddress.postalCode').trim().notEmpty(),
  body('shippingAddress.country').trim().notEmpty(),
  body('paymentMethod').isIn(['razorpay', 'cod']), // ✅ replaced stripe with razorpay
];

const createOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || !cart.items.length) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const itemsPrice = roundMoney(
    cart.items.reduce((sum, line) => {
      const p = line.product;
      if (!p) return sum;
      return sum + line.price * line.qty;
    }, 0)
  );

  const shippingPrice = roundMoney(
    Number(req.body.shippingPrice) >= 0 ? Number(req.body.shippingPrice) : 99
  );
  const taxPrice = roundMoney(
    Number(req.body.taxPrice) >= 0 ? Number(req.body.taxPrice) : itemsPrice * 0.18
  );
  const discount = roundMoney(Number(cart.discount) || 0);
  const totalPrice = roundMoney(itemsPrice + shippingPrice + taxPrice - discount);

  // Build order items + check stock
  const orderItems = [];
  for (const line of cart.items) {
    const p = line.product;
    if (!p) continue;
    if (p.stock < line.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${p.name}`);
    }
    orderItems.push({
      product: p._id,
      name: p.name,
      image: p.images?.[0]?.url || '',
      price: line.price,
      qty: line.qty,
    });
  }

  const paymentMethod = req.body.paymentMethod;
  let paymentResult = {};
  let isPaid = false;
  let paidAt = undefined;
  let orderStatus = 'pending';

  // ✅ Razorpay: payment already verified before this call
  // Frontend calls /api/payment/verify first, then calls createOrder
  if (paymentMethod === 'razorpay') {
    const razorpayPaymentId = req.body.razorpayPaymentId;
    if (!razorpayPaymentId) {
      res.status(400);
      throw new Error('Razorpay payment ID is required');
    }
    paymentResult = {
      id: razorpayPaymentId,
      status: 'paid',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    isPaid = true;
    paidAt = new Date();
    orderStatus = 'processing';
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress: req.body.shippingAddress,
    paymentMethod,
    paymentResult,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    status: orderStatus,
    isPaid,
    paidAt,
  });

  // Decrement stock
  for (const line of cart.items) {
    const p = line.product;
    await Product.findByIdAndUpdate(p._id, {
      $inc: { stock: -line.qty, sold: line.qty },
    });
  }

  // Update coupon usage
  if (cart.couponApplied?.code) {
    const coupon = await Coupon.findOne({ code: cart.couponApplied.code });
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }
  }

  // Clear cart
  cart.items = [];
  cart.couponApplied = { code: '', discountType: '', discountValue: 0 };
  cart.discount = 0;
  await cart.save();

  // Send confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmation #${order._id}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Order ID: <strong>${order._id}</strong></p>
        <p>Total: <strong>₹${order.totalPrice.toFixed(2)}</strong></p>
        <p>Payment: ${paymentMethod === 'razorpay' ? '✅ Paid Online' : '💵 Cash on Delivery'}</p>
        <p>We'll notify you once your order is shipped.</p>
      `,
    });
  } catch (e) {
    console.warn('Order email failed:', e.message);
  }

  res.status(201).json({ success: true, order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const orderUserId = order.user?._id?.toString?.() || order.user?.toString?.();
  if (orderUserId !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  res.json({ success: true, order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (!['pending', 'processing'].includes(order.status)) {
    res.status(400);
    throw new Error('Only pending or processing orders can be cancelled');
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.qty, sold: -item.qty },
    });
  }

  order.status = 'cancelled';
  await order.save();
  res.json({ success: true, order });
});

module.exports = {
  createOrder,
  createOrderRules,
  getMyOrders,
  getOrderById,
  cancelOrder,
};