const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/register',
  authLimiter,
  authController.registerRules,
  authController.register
);
router.post('/login', authLimiter, authController.loginRules, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authLimiter, authController.refreshToken);
router.get('/me', protect, authController.getMe);
router.put(
  '/update-profile',
  protect,
  upload.single('avatar'),
  authController.updateProfileRules,
  authController.updateProfile
);
router.put(
  '/change-password',
  protect,
  authController.changePasswordRules,
  authController.changePassword
);

router.get('/addresses', protect, authController.getAddresses);
router.post('/addresses', protect, authController.addressRules, authController.addAddress);
router.put('/addresses/:id', protect, authController.addressRules, authController.updateAddress);
router.delete('/addresses/:id', protect, authController.deleteAddress);

router.get('/wishlist', protect, authController.getWishlist);
router.post(
  '/wishlist',
  protect,
  authController.toggleWishlistRules,
  authController.toggleWishlist
);

module.exports = router;
