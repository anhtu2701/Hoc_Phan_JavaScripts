const Room = require('../models/Room');

class RoomController {
    // [GET] /api/rooms - Lấy danh sách phòng
    async getAllRooms(req, res) {
        try {
            const result = await Room.findAll();
            res.json(result);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /api/rooms/:id - Lấy chi tiết phòng
    async getRoomById(req, res) {
        try {
            const result = await Room.findById(req.params.id);
            res.json(result);
        } catch (error) {
            console.error('Error fetching room:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [POST] /api/rooms - Tạo phòng mới (chỉ admin)
    async createRoom(req, res) {
        try {
            const roomData = req.body;

            // Nếu có ảnh tạm thời, di chuyển sang houses
            if (roomData.tempFilename) {
                const { getNextRoomCode, moveImageFromTemp } = require('../../utils/roomUtils');

                const roomCode = getNextRoomCode();
                
                const moveResult = moveImageFromTemp(roomData.tempFilename, roomCode);

                if (moveResult.success) {
                    roomData.roomID = roomCode;  
                    roomData.imageURL = moveResult.url;
                    delete roomData.tempFilename;
                } else {
                    return res.status(500).json({
                        success: false,
                        message: 'Lỗi di chuyển ảnh từ temp sang houses: ' + moveResult.error
                    });
                }
            } else {
                const { getNextRoomCode } = require('../../utils/roomUtils');
                roomData.roomID = getNextRoomCode();
            }

            const result = await Room.create(roomData);
            res.json(result);
        } catch (error) {
            console.error('Lỗi tạo phòng:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [PUT] /api/rooms/:id - Cập nhật phòng (chỉ admin)
    async updateRoom(req, res) {
        try {
            const result = await Room.update(req.params.id, req.body);
            res.json(result);
        } catch (error) {
            console.error('Error updating room:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [DELETE] /api/rooms/:id - Xóa phòng (chỉ admin)
    async deleteRoom(req, res) {
        try {
            const result = await Room.delete(req.params.id);
            res.json(result);
        } catch (error) {
            console.error('Error deleting room:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new RoomController();