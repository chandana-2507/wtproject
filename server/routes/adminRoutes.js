const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', adminController.getStats);
router.get('/orders', adminController.getAdminOrders);
router.put('/orders/:id', adminController.updateOrderRules, adminController.updateOrderStatus);

router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.put(
  '/users/:id/role',
  adminController.updateUserRoleRules,
  adminController.updateUserRole
);

module.exports = router;
