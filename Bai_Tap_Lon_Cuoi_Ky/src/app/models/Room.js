const db = require('../../config/db');
const { deleteRoomImage } = require('../../utils/roomUtils');

class Room {
    // Lấy tất cả phòng 
    static async findAll() {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(`
                SELECT roomID, title, description, imageURL, area, price, address, status, createdAt
                FROM rooms 
                ORDER BY roomID ASC
            `);

            return {
                success: true,
                data: { rooms: rows }
            };
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng:', error);
            return { success: false, message: 'Lỗi khi lấy danh sách phòng' };
        }
    }

    // Lấy phòng theo ID
    static async findById(id) {
        try {
            const pool = db.getPool();
            const [roomRows] = await pool.execute(`
                SELECT roomID, title, description, imageURL, area, price, address, status, createdAt
                FROM rooms WHERE roomID = ?
            `, [id]);

            if (roomRows.length === 0) {
                return { success: false, message: 'Không tìm thấy phòng' };
            }

            const room = roomRows[0];

            return {
                success: true,
                data: room
            };
        } catch (error) {
            console.error('Lỗi khi lấy thông tin phòng:', error);
            return { success: false, message: 'Lỗi khi lấy thông tin phòng' };
        }
    }

    // Tạo phòng mới
    static async create(roomData) {
        try {
            const { title, description, imageURL, area, price, address, status = 'available' } = roomData;

            // Validate
            if (!title || !area || !price || !address) {
                return { success: false, message: 'Thiếu thông tin bắt buộc' };
            }

            const pool = db.getPool();

            // Tạo roomID mới
            const newRoomId = await this.generateRoomId();

            const [result] = await pool.execute(`
                INSERT INTO rooms (roomID, title, description, imageURL, area, price, address, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [newRoomId, title, description, imageURL, area, price, address, status]);

            return {
                success: true,
                data: { roomID: newRoomId },
                message: 'Tạo phòng thành công'
            };
        } catch (error) {
            console.error('Lỗi khi tạo phòng:', error);
            return { success: false, message: 'Lỗi khi tạo phòng' };
        }
    }

    // Cập nhật phòng
    static async update(id, roomData) {
        try {
            const pool = db.getPool();
            const { title, description, imageURL, area, price, address, status } = roomData;
    
            // Validation chi tiết
            if (!title || !area || !price || !address) {
                return { success: false, message: 'Thiếu thông tin bắt buộc' };
            }
    
            if (price <= 0) {
                return { success: false, message: 'Giá phòng phải lớn hơn 0' };
            }
    
            if (area <= 0) {
                return { success: false, message: 'Diện tích phải lớn hơn 0' };
            }
    
            // Kiểm tra phòng có tồn tại không
            const [existingRoom] = await pool.execute(
                'SELECT roomID FROM rooms WHERE roomID = ?',
                [id]
            );
    
            if (existingRoom.length === 0) {
                return { success: false, message: 'Không tìm thấy phòng để cập nhật' };
            }
    
            // SQL với xử lý null
            const updateSQL = `
            UPDATE rooms 
            SET title = ?, description = ?, imageURL = ?, area = ?, price = ?, address = ?, status = ?
            WHERE roomID = ?
        `;

        const [result] = await pool.execute(updateSQL, [
            title, 
            description || null, 
            imageURL || null, 
            area, 
            price, 
            address, 
            status, 
            id
        ]);
    
            if (result.affectedRows === 0) {
                return { success: false, message: 'Không có thay đổi nào được thực hiện' };
            }
    
            return { success: true, message: 'Cập nhật phòng thành công' };
        } catch (error) {
            console.error('Lỗi khi cập nhật phòng:', error);
            
            // Xử lý lỗi cụ thể
            if (error.code === 'ER_DUP_ENTRY') {
                return { success: false, message: 'Thông tin phòng đã tồn tại' };
            }
            
            return { success: false, message: 'Lỗi khi cập nhật phòng: ' + error.message };
        }
    }

    // Xóa phòng
    static async delete(id) {
        try {
            const pool = db.getPool();

            // Lấy thông tin phòng trước khi xóa (để lấy imageURL)
            const [roomInfo] = await pool.execute(
                'SELECT imageURL FROM rooms WHERE roomID = ?',
                [id]
            );

            if (roomInfo.length === 0) {
                return { success: false, message: 'Không tìm thấy phòng để xóa' };
            }

            // Xóa ảnh trước (nếu có)
            const imageURL = roomInfo[0].imageURL;
            if (imageURL && imageURL !== '') {
                const deleteImageResult = deleteRoomImage(imageURL);
                if (!deleteImageResult.success) {
                    console.warn('Không thể xóa ảnh:', deleteImageResult.error);
                    // Vẫn tiếp tục xóa phòng dù ảnh xóa thất bại
                }
            }

            // Xóa phòng khỏi database
            const [result] = await pool.execute('DELETE FROM rooms WHERE roomID = ?', [id]);

            if (result.affectedRows === 0) {
                return { success: false, message: 'Không tìm thấy phòng để xóa' };
            }

            return {
                success: true,
                message: imageURL ? 'Xóa phòng và ảnh thành công' : 'Xóa phòng thành công'
            };
        } catch (error) {
            console.error('Lỗi khi xóa phòng:', error);
            return { success: false, message: 'Lỗi khi xóa phòng' };
        }
    }

    // Tạo mã phòng tự động
    static async generateRoomId() {
        try {
            const pool = db.getPool();
            const [result] = await pool.execute('SELECT roomID FROM rooms ORDER BY roomID DESC LIMIT 1');

            if (result.length === 0) {
                return 'CT0001';
            }

            const lastId = result[0].roomID;
            const number = parseInt(lastId.substring(2)) + 1;
            return `CT${number.toString().padStart(4, '0')}`;
        } catch (error) {
            console.error('Error generating room ID:', error);
            const random = Math.floor(Math.random() * 9999) + 1;
            return `CT${random.toString().padStart(4, '0')}`;
        }
    }

    // Thống kê đơn giản
    static async getStats() {
        try {
            const pool = db.getPool();
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as totalRooms,
                    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as availableRooms,
                    SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupiedRooms,
                    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenanceRooms
                FROM rooms
            `);

            return { success: true, data: stats[0] };
        } catch (error) {
            console.error('Error in Room.getStats:', error);
            return { success: false, message: 'Lỗi khi lấy thống kê' };
        }
    }
}

module.exports = Room;