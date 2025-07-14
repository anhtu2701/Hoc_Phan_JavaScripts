const express = require('express');
const router = express.Router();
const homeController = require('../app/controllers/HomeController');

// [GET] / - Trang chủ
router.get('/', homeController.index);

// [GET] /room/:id - Chi tiết phòng
router.get('/room/:id', homeController.roomDetail);

module.exports = router;