const express = require('express');
const router = express.Router();
const loginController = require('../app/controllers/LoginController');
const { redirectIfAuthenticated } = require('../app/middleware/auth');

// GET /login - Hiển thị trang đăng nhập (chỉ khi chưa đăng nhập)
router.get('/', redirectIfAuthenticated, loginController.index);

// POST /login - Xử lý đăng nhập
router.post('/', loginController.login);

// POST /logout - Xử lý đăng xuất
router.post('/logout', loginController.logout);

module.exports = router;