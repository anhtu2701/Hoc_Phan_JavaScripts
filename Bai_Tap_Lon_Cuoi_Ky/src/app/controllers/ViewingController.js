const RoomViewing = require('../models/RoomsViewing');
const Room = require('../models/Room');

class ViewingController {
    // [GET] /api/viewings - Lấy lịch hẹn của user hiện tại
    async getUserViewings(req, res) {
        try {
            const userID = req.session.user.id;
            const result = await RoomViewing.getByUserId(userID);
            
            res.json(result);
        } catch (error) {
            console.error('Error in getUserViewings:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [POST] /api/viewings - Đặt lịch hẹn mới
    async bookViewing(req, res) {
        try {
            const userID = req.session.user ? req.session.user.id : null;

            if (!userID) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Vui lòng đăng nhập để đặt lịch' 
                });
            }

            const { roomID, viewDate, timeSlot } = req.body;

            // Validate input
            if (!roomID || !viewDate || !timeSlot) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Thiếu thông tin bắt buộc' 
                });
            }

            const result = await RoomViewing.bookViewing({
                userID, roomID, viewDate, timeSlot
            });

            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in bookViewing:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /api/viewings/available-slots/:roomID/:date - Lấy khung giờ còn trống
    async getAvailableSlots(req, res) {
        try {
            const { roomID, date } = req.params;
            
            // Kiểm tra phòng có thể đặt lịch không
            const roomCheck = await RoomViewing.checkRoomAvailableForBooking(roomID);
            if (!roomCheck.success) {
                return res.status(400).json(roomCheck);
            }
            
            const result = await RoomViewing.getBookedTimeSlots(roomID, date);
            
            // Tất cả khung giờ có thể
            const allSlots = [
                '08:00-09:00', '09:00-10:00', '10:00-11:00',
                '13:00-14:00', '14:00-15:00', '15:00-16:00'
            ];
            
            // Khung giờ còn trống
            const availableSlots = allSlots.filter(slot => 
                !result.data.includes(slot)
            );

            res.json({ 
                success: true, 
                data: { 
                    availableSlots, 
                    bookedSlots: result.data 
                }
            });
        } catch (error) {
            console.error('Error in getAvailableSlots:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [PUT] /api/viewings/:id/cancel - Hủy lịch hẹn
    async cancelViewing(req, res) {
        try {
            const { id } = req.params;
            const userID = req.session.user.id;

            const result = await RoomViewing.cancelViewing(id, userID);
            res.json(result);
        } catch (error) {
            console.error('Error in cancelViewing:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /api/viewings/all - Lấy tất cả lịch hẹn (cho admin)
    async getAllViewings(req, res) {
        try {
            const result = await RoomViewing.getAllViewings();
            res.json(result);
        } catch (error) {
            console.error('Error in getAllViewings:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [PUT] /api/viewings/:id/status - Cập nhật trạng thái lịch hẹn (cho admin)
    async updateViewingStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, note } = req.body;

            const result = await RoomViewing.updateViewingStatus(id, status, note);
            res.json(result);
        } catch (error) {
            console.error('Error in updateViewingStatus:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new ViewingController();