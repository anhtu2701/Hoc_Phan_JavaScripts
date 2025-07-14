const db = require('../../config/db');

class RoomViewing {
    // Lấy lịch hẹn của user
    static async getByUserId(userID) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(`
                SELECT rv.*, r.title as roomTitle, r.address, r.imageURL, r.status as roomStatus
                FROM roomsViewing rv
                LEFT JOIN rooms r ON rv.roomID = r.roomID
                WHERE rv.userID = ?
                ORDER BY rv.viewDate DESC, rv.timeSlot DESC
            `, [userID]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error fetching user viewings:', error);
            return { success: false, data: [] };
        }
    }

    // Kiểm tra phòng có thể đặt lịch không
    static async checkRoomAvailableForBooking(roomID) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(
                'SELECT status FROM rooms WHERE roomID = ?',
                [roomID]
            );
            
            if (rows.length === 0) {
                return { success: false, message: 'Phòng không tồn tại' };
            }
            
            const roomStatus = rows[0].status;
            if (roomStatus === 'occupied' || roomStatus === 'maintenance') {
                return { 
                    success: false, 
                    message: `Phòng đang ở trạng thái ${roomStatus === 'occupied' ? 'đã có người ở' : 'bảo trì'}, không thể đặt lịch` 
                };
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error checking room availability:', error);
            return { success: false, message: 'Lỗi khi kiểm tra phòng' };
        }
    }

    // Kiểm tra khung giờ có trống không
    static async checkTimeSlotAvailable(roomID, viewDate, timeSlot) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(
                'SELECT * FROM roomsViewing WHERE roomID = ? AND viewDate = ? AND timeSlot = ? AND status = "confirmed"',
                [roomID, viewDate, timeSlot]
            );
            return rows.length === 0;
        } catch (error) {
            console.error('Error checking time slot:', error);
            return false;
        }
    }

    // Đặt lịch hẹn
    static async bookViewing(data) {
        try {
            const { userID, roomID, viewDate, timeSlot } = data;
            
            // Kiểm tra phòng có thể đặt lịch không
            const roomCheck = await this.checkRoomAvailableForBooking(roomID);
            if (!roomCheck.success) {
                return roomCheck;
            }
            
            // Kiểm tra khung giờ có trống không
            const isAvailable = await this.checkTimeSlotAvailable(roomID, viewDate, timeSlot);
            if (!isAvailable) {
                return { success: false, message: 'Khung giờ này đã được đặt' };
            }

            // Kiểm tra ngày không được trong quá khứ
            const today = new Date().toISOString().split('T')[0];
            if (viewDate < today) {
                return { success: false, message: 'Không thể đặt lịch trong quá khứ' };
            }

            // Kiểm tra user có lịch hẹn conflict không
            const conflictCheck = await this.checkUserScheduleConflict(userID, viewDate, timeSlot);
            if (!conflictCheck.success) {
                return conflictCheck;
            }

            // Kiểm tra user đã có lịch hẹn chưa hoàn thành cho phòng này chưa
            const pool = db.getPool();
            const [existingViewing] = await pool.execute(
                'SELECT * FROM roomsViewing WHERE userID = ? AND roomID = ? AND status IN ("confirmed") ORDER BY viewDate DESC LIMIT 1',
                [userID, roomID]
            );
            
            if (existingViewing.length > 0) {
                return { success: false, message: 'Bạn đã có lịch hẹn đang chờ xử lý cho phòng này' };
            }

            const [result] = await pool.execute(
                'INSERT INTO roomsViewing (userID, roomID, viewDate, timeSlot, status) VALUES (?, ?, ?, ?, "confirmed")',
                [userID, roomID, viewDate, timeSlot]
            );

            return { success: true, data: { viewingID: result.insertId }, message: 'Đặt lịch hẹn thành công' };
        } catch (error) {
            console.error('Error booking viewing:', error);
            return { success: false, message: 'Lỗi khi đặt lịch hẹn' };
        }
    }

    // Lấy khung giờ đã đặt cho một phòng trong ngày
    static async getBookedTimeSlots(roomID, viewDate) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(
                'SELECT timeSlot FROM roomsViewing WHERE roomID = ? AND viewDate = ? AND status = "confirmed"',
                [roomID, viewDate]
            );
            return { success: true, data: rows.map(row => row.timeSlot) };
        } catch (error) {
            console.error('Error fetching booked slots:', error);
            return { success: false, data: [] };
        }
    }
    
    // Hủy lịch hẹn
    static async cancelViewing(viewingID, userID) {
        try {
            const pool = db.getPool();
            
            const [viewing] = await pool.execute(
                'SELECT * FROM roomsViewing WHERE viewingID = ? AND userID = ? AND status = "confirmed"',
                [viewingID, userID]
            );

            if (viewing.length === 0) {
                return { success: false, message: 'Không tìm thấy lịch hẹn hoặc lịch hẹn đã được xử lý' };
            }

            const [result] = await pool.execute(
                'UPDATE roomsViewing SET status = "cancelled" WHERE viewingID = ?',
                [viewingID]
            );

            return { success: true, message: 'Hủy lịch hẹn thành công' };
        } catch (error) {
            console.error('Error cancelling viewing:', error);
            return { success: false, message: 'Lỗi khi hủy lịch hẹn' };
        }
    }

    // Cập nhật trạng thái lịch hẹn (cho admin)
    static async updateViewingStatus(viewingID, newStatus, adminNote = null) {
        try {
            const pool = db.getPool();
            
            const validStatuses = ['confirmed', 'completed', 'cancelled'];
            if (!validStatuses.includes(newStatus)) {
                return { success: false, message: 'Trạng thái không hợp lệ' };
            }

            const [viewing] = await pool.execute(
                'SELECT * FROM roomsViewing WHERE viewingID = ?',
                [viewingID]
            );

            if (viewing.length === 0) {
                return { success: false, message: 'Không tìm thấy lịch hẹn' };
            }

            // Cập nhật trạng thái
            const [result] = await pool.execute(
                'UPDATE roomsViewing SET status = ? WHERE viewingID = ?',
                [newStatus, viewingID]
            );

            return { success: true, message: `Cập nhật trạng thái thành ${newStatus} thành công` };
        } catch (error) {
            console.error('Error updating viewing status:', error);
            return { success: false, message: 'Lỗi khi cập nhật trạng thái' };
        }
    }

    // Lấy tất cả lịch hẹn (cho admin)
    static async getAllViewings() {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(`
                SELECT rv.*, r.title as roomTitle, r.address, u.fullName as userName, u.email, u.phoneNumber
                FROM roomsViewing rv
                LEFT JOIN rooms r ON rv.roomID = r.roomID
                LEFT JOIN users u ON rv.userID = u.userID
                ORDER BY rv.viewDate DESC, rv.timeSlot DESC
            `);

            return { success: true, data: rows };
        } catch (error) {
            console.error('Error fetching all viewings:', error);
            return { success: false, message: 'Lỗi khi lấy danh sách lịch hẹn' };
        }
    }

    // Lấy thống kê cho dashboard
    static async getStats() {
        try {
            const pool = db.getPool();
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as totalViewings,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmedViewings,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedViewings,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledViewings,
                    SUM(CASE WHEN DATE(viewDate) = CURDATE() THEN 1 ELSE 0 END) as todayViewings
                FROM roomsViewing
            `);
            
            return { success: true, data: stats[0] };
        } catch (error) {
            console.error('Error getting viewing stats:', error);
            return { success: false, message: 'Lỗi khi lấy thống kê' };
        }
    }

    // Lấy lịch hẹn sắp tới (trong vòng 24h)
    static async getUpcomingViewings() {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(`
                SELECT rv.*, r.title as roomTitle, u.fullName as userName, u.email
                FROM roomsViewing rv
                LEFT JOIN rooms r ON rv.roomID = r.roomID
                LEFT JOIN users u ON rv.userID = u.userID
                WHERE rv.status = 'confirmed'
                AND CONCAT(rv.viewDate, ' ', SUBSTRING(rv.timeSlot, 1, 5)) 
                    BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
                ORDER BY rv.viewDate ASC, rv.timeSlot ASC
            `);
            
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting upcoming viewings:', error);
            return { success: false, message: 'Lỗi khi lấy lịch hẹn sắp tới' };
        }
    }

    // Thống kê theo phòng
    static async getRoomStats(roomID) {
        try {
            const pool = db.getPool();
            const [stats] = await pool.execute(`
                SELECT 
                    r.title as roomTitle,
                    COUNT(rv.viewingID) as totalViewings,
                    SUM(CASE WHEN rv.status = 'completed' THEN 1 ELSE 0 END) as completedViewings,
                    SUM(CASE WHEN rv.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledViewings,
                    SUM(CASE WHEN rv.status = 'confirmed' THEN 1 ELSE 0 END) as confirmedViewings,
                    AVG(f.rating) as averageRating,
                    COUNT(f.feedbackID) as totalFeedbacks
                FROM rooms r
                LEFT JOIN roomsViewing rv ON r.roomID = rv.roomID
                LEFT JOIN feedbacks f ON r.roomID = f.roomID
                WHERE r.roomID = ?
                GROUP BY r.roomID
            `, [roomID]);
            
            return { 
                success: true, 
                data: stats[0] || null
            };
        } catch (error) {
            console.error('Error getting room stats:', error);
            return { success: false, message: 'Lỗi khi lấy thống kê phòng' };
        }
    }

    // Dọn dẹp lịch hẹn đã hủy cũ
    static async cleanupCancelledViewings(daysOld = 30) {
        try {
            const pool = db.getPool();
            const [result] = await pool.execute(`
                DELETE FROM roomsViewing 
                WHERE status = 'cancelled' 
                AND viewDate < DATE_SUB(CURDATE(), INTERVAL ? DAY)
            `, [daysOld]);
            
            return { 
                success: true, 
                deletedCount: result.affectedRows,
                message: `Đã xóa ${result.affectedRows} lịch hẹn cũ`
            };
        } catch (error) {
            console.error('Error cleaning up cancelled viewings:', error);
            return { success: false, message: 'Lỗi khi dọn dẹp dữ liệu' };
        }
    }

    // Thống kê hàng ngày
    static async getDailyStats(date = null) {
        try {
            const pool = db.getPool();
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as totalViewings,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedViewings,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledViewings,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmedViewings
                FROM roomsViewing 
                WHERE DATE(viewDate) = ?
            `, [targetDate]);
            
            return { 
                success: true, 
                data: stats[0],
                date: targetDate
            };
        } catch (error) {
            console.error('Error getting daily stats:', error);
            return { success: false, message: 'Lỗi khi lấy thống kê' };
        }
    }

    
    static async updateCompletedViewings() {
        try {
            const pool = db.getPool();
            const [result] = await pool.execute(`
                UPDATE roomsViewing 
                SET status = 'completed' 
                WHERE status = 'confirmed' 
                AND CONCAT(viewDate, ' ', SUBSTRING_INDEX(timeSlot, '-', -1)) < NOW()
            `);
            
            return { 
                success: true, 
                updatedCount: result.affectedRows,
                message: `Đã cập nhật ${result.affectedRows} lịch hẹn`
            };
        } catch (error) {
            console.error('Error updating completed viewings:', error);
            return { success: false, message: 'Lỗi khi cập nhật trạng thái' };
        }
    }

    // Kiểm tra user có lịch hẹn nào conflict không
    static async checkUserScheduleConflict(userID, viewDate, timeSlot) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(
                'SELECT rv.*, r.title as roomTitle FROM roomsViewing rv LEFT JOIN rooms r ON rv.roomID = r.roomID WHERE rv.userID = ? AND rv.viewDate = ? AND rv.timeSlot = ? AND rv.status = "confirmed"',
                [userID, viewDate, timeSlot]
            );
            
            if (rows.length > 0) {
                return { 
                    success: false, 
                    message: `Bạn đã có lịch hẹn xem phòng "${rows[0].roomTitle}" vào thời gian này. Vui lòng chọn thời gian khác.`,
                    conflictViewing: rows[0]
                };
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error checking user schedule conflict:', error);
            return { success: false, message: 'Lỗi khi kiểm tra lịch trình' };
        }
    }

    // Lấy lịch xem phòng hôm nay
    static async getTodayViewings(date = null) {
        try {
            const pool = db.getPool();
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            const [rows] = await pool.execute(`
                SELECT 
                    rv.viewingID,
                    rv.viewDate,
                    rv.timeSlot,
                    rv.status,
                    rv.createdAt,
                    r.title as roomTitle,
                    r.address as roomAddress,
                    u.fullName as userName,
                    u.email as userEmail,
                    u.phoneNumber as userPhone
                FROM roomsViewing rv
                LEFT JOIN rooms r ON rv.roomID = r.roomID
                LEFT JOIN users u ON rv.userID = u.userID
                WHERE DATE(rv.viewDate) = ?
                ORDER BY rv.timeSlot ASC
            `, [targetDate]);
            
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting today viewings:', error);
            return { success: false, message: 'Lỗi khi lấy lịch hôm nay' };
        }
    }

    // Lấy hoạt động gần đây
    static async getRecentActivities() {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(`
                SELECT 
                    rv.viewingID,
                    rv.viewDate,
                    rv.timeSlot,
                    rv.status,
                    rv.createdAt,
                    r.title as roomTitle,
                    u.fullName as userName,
                    CASE 
                        WHEN rv.status = 'confirmed' THEN CONCAT(u.fullName, ' đã đặt lịch xem phòng ', r.title)
                        WHEN rv.status = 'completed' THEN CONCAT('Hoàn thành lịch xem phòng ', r.title, ' của ', u.fullName)
                        WHEN rv.status = 'cancelled' THEN CONCAT('Hủy lịch xem phòng ', r.title, ' của ', u.fullName)
                        ELSE CONCAT(u.fullName, ' - ', r.title)
                    END as activity
                FROM roomsViewing rv
                LEFT JOIN rooms r ON rv.roomID = r.roomID
                LEFT JOIN users u ON rv.userID = u.userID
                ORDER BY rv.createdAt DESC
                LIMIT 10
            `);
            
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting recent activities:', error);
            return { success: false, message: 'Lỗi khi lấy hoạt động gần đây' };
        }
    }

    // Lấy tất cả lịch xem phòng cho admin
    static async getAllViewingsForAdmin(statusFilter = null) {
        try {
            const pool = db.getPool();
            
            let query = `
                SELECT 
                    rv.viewingID,
                    rv.viewDate,
                    rv.timeSlot,
                    rv.status,
                    rv.createdAt,
                    r.roomID,
                    r.title as roomTitle,
                    r.address as roomAddress,
                    u.userID,
                    u.fullName as userName,
                    u.email as userEmail,
                    u.phoneNumber as userPhone
                FROM roomsViewing rv
                LEFT JOIN rooms r ON rv.roomID = r.roomID
                LEFT JOIN users u ON rv.userID = u.userID
            `;
            
            const params = [];
            
            if (statusFilter) {
                query += ` WHERE rv.status = ?`;
                params.push(statusFilter);
            }
            
            query += ` ORDER BY rv.createdAt DESC`; // ✅ Sắp xếp theo ngày tạo mới nhất
            
            const [rows] = await pool.execute(query, params);
            
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting all viewings for admin:', error);
            return { success: false, message: 'Lỗi khi lấy danh sách lịch xem phòng' };
        }
    }

    // Cập nhật method getTodayViewings để giữ lại cho thống kê
    static async getTodayViewings(date = null) {
        try {
            const pool = db.getPool();
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            const [rows] = await pool.execute(`
                SELECT COUNT(*) as count
                FROM roomsViewing rv
                WHERE DATE(rv.viewDate) = ?
            `, [targetDate]);
            
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Error getting today viewings count:', error);
            return { success: false, message: 'Lỗi khi lấy số lịch hôm nay' };
        }
    }
}

module.exports = RoomViewing;