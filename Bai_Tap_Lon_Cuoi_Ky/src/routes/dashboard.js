const express = require('express');
const router = express.Router();
const dashboardController = require('../app/controllers/DashboardController');
const { requireAuth, requireAdmin } = require('../app/middleware/auth');

// Tất cả routes trong dashboard đều cần authentication và admin role
router.use(requireAuth);
router.use(requireAdmin);  

router.get('/rooms', dashboardController.roomsManagement);
router.get('/users', dashboardController.usersManagement);
router.get('/', dashboardController.index);

module.exports = router;