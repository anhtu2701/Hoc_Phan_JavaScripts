const db = require('../../config/db');
const path = require('path');
const fs = require('fs');

class Room {
    // [GET] Lấy tất cả phòng với filters và pagination
    static async findAll(options = {}) {
        try {
            const {
                limit = 20,
                offset = 0,
                search = '',
                status = '',
                minPrice = '',
                maxPrice = '',
                sortBy = 'MaPhong',
                sortOrder = 'ASC'
            } = options;

            // Convert to numbers to fix SQL parameter issue
            const numLimit = parseInt(limit) || 20;
            const numOffset = parseInt(offset) || 0;

            console.log('Room.findAll options:', options); // Debug log
            console.log('Converted numbers:', { numLimit, numOffset }); // Debug log

            const pool = db.getPool();
            let query = `SELECT p.*, n.HoTen FROM PHONG p LEFT JOIN NGUOIDUNG n ON p.MaChuNha = n.MaNguoiDung WHERE 1=1`;

            const queryParams = [];

            // Thêm điều kiện tìm kiếm
            if (search && search.trim() !== '') {
                query += ` AND (p.TieuDe LIKE ? OR p.MoTa LIKE ? OR p.DiaChi LIKE ?)`;
                const searchTerm = `%${search.trim()}%`;
                queryParams.push(searchTerm, searchTerm, searchTerm);
            }

            // Thêm điều kiện trạng thái
            if (status && status.trim() !== '') {
                query += ` AND p.TrangThai = ?`;
                queryParams.push(status.trim());
            }

            // Thêm điều kiện giá
            if (minPrice !== '' && !isNaN(minPrice)) {
                query += ` AND p.GiaThue >= ?`;
                queryParams.push(parseFloat(minPrice));
            }

            if (maxPrice !== '' && !isNaN(maxPrice)) {
                query += ` AND p.GiaThue <= ?`;
                queryParams.push(parseFloat(maxPrice));
            }

            // Đếm tổng số records trước khi phân trang
            const countQuery = `SELECT COUNT(*) as total FROM PHONG p LEFT JOIN NGUOIDUNG n ON p.MaChuNha = n.MaNguoiDung WHERE 1=1`;
            
            // Thêm điều kiện cho count query giống với main query
            let countQueryWithConditions = countQuery;
            const countParams = [];
            
            if (search && search.trim() !== '') {
                countQueryWithConditions += ` AND (p.TieuDe LIKE ? OR p.MoTa LIKE ? OR p.DiaChi LIKE ?)`;
                const searchTerm = `%${search.trim()}%`;
                countParams.push(searchTerm, searchTerm, searchTerm);
            }

            if (status && status.trim() !== '') {
                countQueryWithConditions += ` AND p.TrangThai = ?`;
                countParams.push(status.trim());
            }

            if (minPrice !== '' && !isNaN(minPrice)) {
                countQueryWithConditions += ` AND p.GiaThue >= ?`;
                countParams.push(parseFloat(minPrice));
            }

            if (maxPrice !== '' && !isNaN(maxPrice)) {
                countQueryWithConditions += ` AND p.GiaThue <= ?`;
                countParams.push(parseFloat(maxPrice));
            }
            
            console.log('Count query:', countQueryWithConditions); // Debug log
            console.log('Query params for count:', countParams); // Debug log
            
            const [totalResult] = await pool.execute(countQueryWithConditions, countParams);
            const total = totalResult[0].total;

            // Thêm sắp xếp và phân trang với string concatenation để tránh lỗi parameter
            query += ` ORDER BY p.${sortBy} ${sortOrder} LIMIT ${numLimit} OFFSET ${numOffset}`;

            console.log('Final query:', query); // Debug log
            console.log('Final params:', queryParams); // Debug log

            const [rows] = await pool.execute(query, queryParams);

            return {
                success: true,
                data: {
                    rooms: rows,
                    total,
                    limit: numLimit,
                    offset: numOffset
                }
            };

        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách phòng',
                error: error.message
            };
        }
    }

    // [GET] Lấy phòng theo ID
    static async findById(id) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(`
                SELECT p.*, n.HoTen 
                FROM PHONG p 
                LEFT JOIN NGUOIDUNG n ON p.MaChuNha = n.MaNguoiDung 
                WHERE p.MaPhong = ?
            `, [id]);

            if (rows.length === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy phòng'
                };
            }

            return {
                success: true,
                data: rows[0]
            };

        } catch (error) {
            console.error('Lỗi khi lấy thông tin phòng:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin phòng',
                error: error.message
            };
        }
    }

    // [POST] Tạo phòng mới
    static async create(roomData) {
        try {
            const {
                MaChuNha,
                TieuDe,
                MoTa,
                URLAnhPhong,
                DienTich,
                GiaThue,
                TrangThai = 'conTrong',
                DiaChi,
                tempImageUrl
            } = roomData;

            // Validate required fields
            if (!MaChuNha) {
                return {
                    success: false,
                    message: 'Mã chủ nhà là bắt buộc'
                };
            }

            if (!TieuDe || TieuDe.trim() === '') {
                return {
                    success: false,
                    message: 'Tiêu đề phòng là bắt buộc'
                };
            }

            if (!DienTich || isNaN(DienTich) || DienTich <= 0) {
                return {
                    success: false,
                    message: 'Diện tích phải là số dương'
                };
            }

            if (!GiaThue || isNaN(GiaThue) || GiaThue <= 0) {
                return {
                    success: false,
                    message: 'Giá thuê phải là số dương'
                };
            }

            if (!DiaChi || DiaChi.trim() === '') {
                return {
                    success: false,
                    message: 'Địa chỉ là bắt buộc'
                };
            }

            const pool = db.getPool();

            // Tạo mã phòng mới
            const [maxRoom] = await pool.execute('SELECT MaPhong FROM PHONG ORDER BY MaPhong DESC LIMIT 1');
            let newRoomId;
            if (maxRoom.length > 0) {
                const lastId = parseInt(maxRoom[0].MaPhong.replace('CT', ''));
                newRoomId = 'CT' + String(lastId + 1).padStart(4, '0');
            } else {
                newRoomId = 'CT0001';
            }

            // Map status từ frontend sang database
            const statusMap = {
                'available': 'conTrong',
                'occupied': 'dangThue',
                'approved': 'daDuyet',
                'pending': 'dangChoDuyet'
            };
            const dbStatus = statusMap[TrangThai] || 'conTrong';

            // Xử lý ảnh nếu có
            let finalImageUrl = URLAnhPhong;
            if (tempImageUrl) {
                // Di chuyển ảnh từ temp sang final
                const tempPath = path.join(__dirname, '../../public', tempImageUrl);
                const extension = path.extname(tempImageUrl);
                const finalFilename = newRoomId.toLowerCase() + extension;
                const finalPath = path.join(__dirname, '../../public/img/houses', finalFilename);

                if (fs.existsSync(tempPath)) {
                    const finalDir = path.dirname(finalPath);
                    if (!fs.existsSync(finalDir)) {
                        fs.mkdirSync(finalDir, { recursive: true });
                    }
                    fs.renameSync(tempPath, finalPath);
                    finalImageUrl = `/img/houses/${finalFilename}`;
                }
            }

            const [result] = await pool.execute(`
                INSERT INTO PHONG (MaPhong, MaChuNha, TieuDe, MoTa, URLAnhPhong, DienTich, GiaThue, TrangThai, DiaChi) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [newRoomId, MaChuNha, TieuDe, MoTa, finalImageUrl, DienTich, GiaThue, dbStatus, DiaChi]);

            return {
                success: true,
                data: {
                    MaPhong: newRoomId,
                    insertId: result.insertId
                },
                message: 'Tạo phòng thành công'
            };

        } catch (error) {
            console.error('Lỗi khi tạo phòng:', error);
            return {
                success: false,
                message: 'Lỗi khi tạo phòng',
                error: error.message
            };
        }
    }

    // [PUT] Cập nhật phòng
    static async update(id, roomData) {
        try {
            const pool = db.getPool();
            
            // Lọc ra các field có thể cập nhật
            const allowedFields = ['TieuDe', 'MoTa', 'URLAnhPhong', 'DienTich', 'GiaThue', 'TrangThai', 'DiaChi'];
            const updateFields = [];
            const updateValues = [];

            for (const [key, value] of Object.entries(roomData)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    if (key === 'TrangThai') {
                        // Map status từ frontend sang database
                        const statusMap = {
                            'available': 'conTrong',
                            'occupied': 'dangThue',
                            'approved': 'daDuyet',
                            'pending': 'dangChoDuyet'
                        };
                        const dbStatus = statusMap[value] || value;
                        updateFields.push(`${key} = ?`);
                        updateValues.push(dbStatus);
                    } else {
                        updateFields.push(`${key} = ?`);
                        updateValues.push(value);
                    }
                }
            }

            if (updateFields.length === 0) {
                return {
                    success: false,
                    message: 'Không có dữ liệu để cập nhật'
                };
            }

            updateValues.push(id);
            const query = `UPDATE PHONG SET ${updateFields.join(', ')}, NgayCapNhat = CURRENT_TIMESTAMP WHERE MaPhong = ?`;

            const [result] = await pool.execute(query, updateValues);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy phòng để cập nhật'
                };
            }

            return {
                success: true,
                message: 'Cập nhật phòng thành công'
            };

        } catch (error) {
            console.error('Lỗi khi cập nhật phòng:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật phòng',
                error: error.message
            };
        }
    }

    // [DELETE] Xóa phòng (soft delete)
    static async delete(id) {
        try {
            const pool = db.getPool();

            // Kiểm tra xem phòng có đang được thuê không
            const [contracts] = await pool.execute(
                'SELECT COUNT(*) as count FROM HOPDONG WHERE MaPhong = ? AND TrangThai = "dangThue"',
                [id]
            );

            if (contracts[0].count > 0) {
                return {
                    success: false,
                    message: 'Không thể xóa phòng đang được thuê'
                };
            }

            const [result] = await pool.execute('DELETE FROM PHONG WHERE MaPhong = ?', [id]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy phòng để xóa'
                };
            }

            return {
                success: true,
                message: 'Xóa phòng thành công'
            };

        } catch (error) {
            console.error('Lỗi khi xóa phòng:', error);
            return {
                success: false,
                message: 'Lỗi khi xóa phòng',
                error: error.message
            };
        }
    }

    // [UTILITY] Generate room ID
    static async generateRoomId() {
        try {
            const pool = db.getPool();
            
            // Tìm mã phòng cuối cùng
            const [result] = await pool.execute(
                'SELECT MaPhong FROM PHONG ORDER BY MaPhong DESC LIMIT 1'
            );

            if (result.length === 0) {
                return 'CT0001';
            }

            // Extract number từ mã cuối cùng (CT0020 -> 20)
            const lastId = result[0].MaPhong;
            const number = parseInt(lastId.substring(2)) + 1;
            
            // Format lại thành CT0XXX
            return `CT${number.toString().padStart(4, '0')}`;

        } catch (error) {
            console.error('Error generating room ID:', error);
            // Fallback: random ID
            const random = Math.floor(Math.random() * 9999) + 1;
            return `CT${random.toString().padStart(4, '0')}`;
        }
    }

    // [GET] Statistics
    static async getStats() {
        try {
            const pool = db.getPool();

            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as totalRooms,
                    SUM(CASE WHEN TrangThai = 'conTrong' THEN 1 ELSE 0 END) as availableRooms,
                    SUM(CASE WHEN TrangThai = 'dangThue' THEN 1 ELSE 0 END) as rentedRooms,
                    SUM(CASE WHEN TrangThai = 'daDuyet' THEN 1 ELSE 0 END) as approvedRooms,
                    SUM(CASE WHEN TrangThai = 'dangChoDuyet' THEN 1 ELSE 0 END) as pendingRooms,
                    AVG(GiaThue) as avgPrice,
                    AVG(DienTich) as avgArea
                FROM PHONG
            `);

            return {
                success: true,
                data: stats[0]
            };

        } catch (error) {
            console.error('Error in Room.getStats:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê'
            };
        }
    }

    // [POST] Bulk operations
    static async bulkUpdate(roomIds, updateData) {
        try {
            const pool = db.getPool();

            if (!roomIds || roomIds.length === 0) {
                return {
                    success: false,
                    message: 'Danh sách phòng không được trống'
                };
            }

            // Validate allowed bulk fields
            const allowedFields = ['TrangThai', 'GiaThue'];
            const updateFields = [];
            const params = [];

            for (let field of allowedFields) {
                if (updateData[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    params.push(updateData[field]);
                }
            }

            if (updateFields.length === 0) {
                return {
                    success: false,
                    message: 'Không có dữ liệu hợp lệ để cập nhật'
                };
            }

            // Build IN clause
            const placeholders = roomIds.map(() => '?').join(',');
            params.push(...roomIds);

            const query = `UPDATE PHONG SET ${updateFields.join(', ')} WHERE MaPhong IN (${placeholders})`;

            const [result] = await pool.execute(query, params);

            return {
                success: true,
                data: {
                    updatedCount: result.affectedRows,
                    message: `Cập nhật thành công ${result.affectedRows} phòng`
                }
            };

        } catch (error) {
            console.error('Error in Room.bulkUpdate:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật hàng loạt'
            };
        }
    }
}

module.exports = Room; 