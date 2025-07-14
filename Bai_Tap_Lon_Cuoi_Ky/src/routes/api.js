const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../app/middleware/auth');
const upload = require('../app/middleware/upload');

// Import controllers
const roomController = require('../app/controllers/RoomController');
const userController = require('../app/controllers/UserController');
const viewingController = require('../app/controllers/ViewingController');
const dashboardController = require('../app/controllers/DashboardController');
const statsController = require('../app/controllers/StatsController');
const uploadController = require('../app/controllers/UploadController');

// room api
router.get('/rooms', roomController.getAllRooms);
router.get('/rooms/:id', roomController.getRoomById);
router.post('/rooms', requireAdmin, roomController.createRoom);
router.put('/rooms/:id', requireAdmin, roomController.updateRoom);
router.delete('/rooms/:id', requireAdmin, roomController.deleteRoom);


// users api
router.get('/users/stats', requireAdmin, userController.getUserStats); 
router.get('/users/export', requireAdmin, userController.exportUsers);
router.put('/users/bulk/status', requireAdmin, userController.bulkUpdateStatus);
router.get('/users', requireAdmin, userController.getAllUsers);
router.post('/users', requireAdmin, userController.createUser);
router.put('/users/:id', requireAdmin, userController.updateUser);
router.get('/users/:id', requireAdmin, userController.getUserById);
router.delete('/users/:id', requireAdmin, userController.deleteUser);

// viewing api
router.get('/viewings', requireAuth, viewingController.getUserViewings);
router.post('/viewings', requireAuth, viewingController.bookViewing);
router.get('/viewings/available-slots/:roomID/:date', viewingController.getAvailableSlots); //Lấy khung giờ trống
router.put('/viewings/:id/cancel', requireAuth, viewingController.cancelViewing);
router.get('/viewings/all', requireAdmin, viewingController.getAllViewings); // for admin lấy all
router.put('/viewings/:id/status', requireAdmin, viewingController.updateViewingStatus);

// dashboard api
router.get('/dashboard/stats', requireAdmin, dashboardController.getStats); //Thống kê tổng quan
router.get('/dashboard/all-viewings', requireAdmin, dashboardController.getAllViewings);
router.get('/dashboard/recent-activities', requireAdmin, dashboardController.getRecentActivities); 
router.put('/dashboard/viewing/:id/status', requireAdmin, dashboardController.updateViewingStatus);

// stats api
router.get('/stats/daily', requireAdmin, statsController.getDailyStats);
router.get('/stats/room/:roomID', requireAdmin, statsController.getRoomStats);

//upload api
router.post('/upload/room-image', requireAdmin, upload.single('image'), uploadController.uploadRoomImage);
router.delete('/upload/room-image/:filename', requireAdmin, uploadController.deleteRoomImage);
router.delete('/upload/temp-image/:filename', requireAdmin, uploadController.deleteTempImage);
router.post('/upload/room-image/update/:roomId', requireAdmin, upload.single('image'), uploadController.updateRoomImage);

module.exports = router; 