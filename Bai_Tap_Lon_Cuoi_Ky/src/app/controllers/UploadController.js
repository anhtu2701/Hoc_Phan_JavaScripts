const { getNextRoomCode, renameImageFile } = require('../../utils/roomUtils');
const fs = require('fs');
const path = require('path');

class UploadController {
    // [POST] /api/upload/room-image - Upload ảnh tạm thời cho phòng
    async uploadRoomImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Không có file được upload' 
                });
            }

            // Chỉ lưu temp, không tạo mã phòng ngay
            const tempFilename = req.file.filename;
            const tempUrl = `/uploads/temp/${tempFilename}`;

            res.json({
                success: true,
                data: {
                    tempFilename: tempFilename,
                    imageUrl: tempUrl,
                },
                message: 'Ảnh đã được lưu tạm thời'
            });
        } catch (error) {
            console.error('Lỗi upload ảnh tạm thời:', error);
            
            // Cleanup temp file nếu có lỗi
            if (req.file) {
                this.cleanupTempFile(req.file.path);
            }
            
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi upload ảnh' 
            });
        }
    }

    // [DELETE] /api/upload/temp-image/:filename - Xóa ảnh tạm thời
    async deleteTempImage(req, res) {
        try {
            const { filename } = req.params;
            const { deleteTempImage } = require('../../utils/roomUtils');

            const result = deleteTempImage(filename);

            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Lỗi xóa ảnh tạm thời:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi xóa ảnh tạm thời'
            });
        }
    }

    // [DELETE] /api/upload/room-image/:filename - Xóa ảnh phòng
    async deleteRoomImage(req, res) {
        try {
            const { filename } = req.params;
            const imagePath = path.join(__dirname, '../../public/img/houses', filename);
            
            // Kiểm tra file có tồn tại
            if (!fs.existsSync(imagePath)) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Không tìm thấy file ảnh' 
                });
            }

            // Xóa file
            fs.unlinkSync(imagePath);
            
            res.json({
                success: true,
                message: 'Đã xóa ảnh thành công'
            });
        } catch (error) {
            console.error('Error deleting room image:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi xóa ảnh' 
            });
        }
    }

    // [POST] /api/upload/room-image/update/:roomId - Cập nhật ảnh phòng (thay ảnh cũ)
    async updateRoomImage(req, res) {
        try {
            const { roomId } = req.params;
            
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Không có file được upload' 
                });
            }

            // Sử dụng roomId làm tên file
            const roomCode = roomId;
            const renameResult = renameImageFile(req.file.path, roomCode);
            
            if (!renameResult.success) {
                this.cleanupTempFile(req.file.path);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Lỗi đổi tên file: ' + renameResult.error 
                });
            }

            res.json({
                success: true,
                data: {
                    roomCode: roomCode,
                    imageUrl: renameResult.url,
                    filename: renameResult.filename
                },
                message: `Đã cập nhật ảnh cho phòng ${roomCode}`
            });
        } catch (error) {
            console.error('Error updating room image:', error);
            
            if (req.file) {
                this.cleanupTempFile(req.file.path);
            }
            
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi cập nhật ảnh' 
            });
        }
    }

    // Utility: Xóa file temp
    cleanupTempFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Error cleaning up temp file:', error);
        }
    }
}

module.exports = new UploadController();