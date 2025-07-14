const Room = require('../models/Room');
const User = require('../models/User');
const RoomViewing = require('../models/RoomsViewing');

class DashboardController {
    index(req, res) {
        res.render("dashboard", {
            layout: "dashboard",
            title: "Dashboard Admin",
            pageCss: "dashboard.css",
            isDashboard: true,
        });
    }

    roomsManagement(req, res) {
        res.render("roomsManagement", {
            layout: "dashboard",
            title: "Quản Lý Phòng Trọ",
            pageCss: "roomsManagement.css",
            isRooms: true,
        });
    }

    usersManagement(req, res) {
        res.render("usersManagement", {
            layout: "dashboard",
            title: "Quản Lý Người Dùng",
            pageCss: "usersManagement.css",
            isUsers: true,
        });
    }

    // [GET] /api/dashboard/stats - Thống kê tổng quan
    async getStats(req, res) {
        try {
            const [userStats, roomStats, viewingStats] = await Promise.all([
                User.getStats(),
                Room.getStats(),
                RoomViewing.getStats()
            ]);

            const data = {
                // User stats
                totalUsers: userStats.success ? userStats.data.totalUsers : 0,
                
                // Room stats
                totalRooms: roomStats.success ? roomStats.data.totalRooms : 0,
                availableRooms: roomStats.success ? roomStats.data.availableRooms : 0,
                occupiedRooms: roomStats.success ? roomStats.data.occupiedRooms : 0,
                occupancyRate: roomStats.success ? roomStats.data.occupancyRate : 0,
                
                // Viewing stats (cập nhật)
                todayViewings: viewingStats.success ? viewingStats.data.todayViewings : 0,
                monthlyViewings: viewingStats.success ? viewingStats.data.totalViewings : 0,
                confirmedViewings: viewingStats.success ? viewingStats.data.confirmedViewings : 0,
                completedViewings: viewingStats.success ? viewingStats.data.completedViewings : 0
            };

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error in getStats:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /api/dashboard/all-viewings - Quản lý tất cả lịch xem phòng
    async getAllViewings(req, res) {
        try {
            const { status } = req.query; 
            const result = await RoomViewing.getAllViewingsForAdmin(status);
            
            res.json(result);
        } catch (error) {
            console.error('Error in getAllViewings:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /api/dashboard/recent-activities - Hoạt động gần đây
    async getRecentActivities(req, res) {
        try {
            const result = await RoomViewing.getRecentActivities();
            res.json(result);
        } catch (error) {
            console.error('Error in getRecentActivities:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [PUT] /api/dashboard/viewing/:id/status - Cập nhật trạng thái lịch xem
    async updateViewingStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const result = await RoomViewing.updateViewingStatus(id, status);
            res.json(result);
        } catch (error) {
            console.error('Error in updateViewingStatus:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new DashboardController();