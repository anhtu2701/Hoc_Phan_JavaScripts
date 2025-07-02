const express = require('express');
const router = express.Router();
const dashboardController = require('../app/controllers/DashboardController');


router.get('/roomsmanagement', dashboardController.roomsManagement);
router.get('/usersmanagement', dashboardController.usersManagement);
router.get('/', dashboardController.index);

module.exports = router;