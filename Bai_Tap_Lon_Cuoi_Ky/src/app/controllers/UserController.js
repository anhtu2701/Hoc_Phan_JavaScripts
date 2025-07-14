const User = require('../models/User');

class UserController {
    // [GET] /api/users - Lấy danh sách người dùng (chỉ admin)
    async getAllUsers(req, res) {
        try {
            const result = await User.findAll();
            res.json(result);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /api/users/stats - Thống kê người dùng
    async getUserStats(req, res) {
        try {
            const result = await User.getStats();
            res.json(result);
        } catch (error) {
            console.error('Error in getUserStats:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /api/users/export - Xuất danh sách người dùng
    async exportUsers(req, res) {
        try {
            // Tạm thời trả về lỗi, sẽ implement sau
            res.status(501).json({ success: false, message: 'Tính năng xuất Excel chưa được implement' });
        } catch (error) {
            console.error('Error in exportUsers:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [PUT] /api/users/bulk/status - Thay đổi trạng thái hàng loạt
    async bulkUpdateStatus(req, res) {
        try {
            const { userIds, status } = req.body;
            
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ success: false, message: 'Danh sách người dùng không hợp lệ' });
            }
            
            if (!status) {
                return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
            }
            
            const result = await User.bulkUpdateStatus(userIds, status);
            res.json(result);
        } catch (error) {
            console.error('Error in bulkUpdateStatus:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /api/users/:id - Lấy thông tin người dùng (chỉ admin)
    async getUserById(req, res) {
        try {
            const result = await User.findById(req.params.id);
            res.json(result);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [POST] /api/users - Tạo người dùng mới (chỉ admin)
    async createUser(req, res) {
        try {
            const result = await User.create(req.body);
            res.json(result);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [PUT] /api/users/:id - Cập nhật người dùng (chỉ admin)
    async updateUser(req, res) {
        try {
            const result = await User.update(req.params.id, req.body);
            res.json(result);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [DELETE] /api/users/:id - Xóa người dùng (chỉ admin)
    async deleteUser(req, res) {
        try {
            const result = await User.delete(req.params.id);
            res.json(result);
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new UserController();