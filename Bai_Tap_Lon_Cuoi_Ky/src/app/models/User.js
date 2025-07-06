const db = require('../../config/db');
const bcrypt = require('bcrypt');

class User {
    // Tìm user theo tên đăng nhập (cho authentication)
    static async findByUsername(username) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(
                'SELECT * FROM NGUOIDUNG WHERE TenDangNhap = ? AND TrangThai = "hoatdong"',
                [username]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Lỗi khi tìm user:', error);
            throw error;
        }
    }

    // Đổi mật khẩu (cho authentication)
    static async changePassword(id, newPassword) {
        try {
            const pool = db.getPool();
            const [result] = await pool.execute(
                'UPDATE NGUOIDUNG SET MatKhau = ? WHERE MaNguoiDung = ?',
                [newPassword, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            throw error;
        }
    }

    // [GET] Lấy tất cả người dùng với filters và pagination
    static async findAll(options = {}) {
        try {
            const {
                limit = 20,
                offset = 0,
                search = '',
                role = '',
                status = '',
                sortBy = 'NgayTao',
                sortOrder = 'DESC'
            } = options;

            const numLimit = parseInt(limit) || 20;
            const numOffset = parseInt(offset) || 0;

            const pool = db.getPool();
            let query = `SELECT MaNguoiDung, CCCD, TenDangNhap, HoTen, Email, SoDienThoai, VaiTro, TrangThai, NgayTao FROM NGUOIDUNG WHERE 1=1`;

            const queryParams = [];

            // Thêm điều kiện tìm kiếm
            if (search && search.trim() !== '') {
                query += ` AND (HoTen LIKE ? OR Email LIKE ? OR TenDangNhap LIKE ? OR CCCD LIKE ?)`;
                const searchTerm = `%${search.trim()}%`;
                queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            // Thêm điều kiện vai trò
            if (role && role.trim() !== '') {
                query += ` AND VaiTro = ?`;
                queryParams.push(role.trim());
            }

            // Thêm điều kiện trạng thái
            if (status && status.trim() !== '') {
                query += ` AND TrangThai = ?`;
                queryParams.push(status.trim());
            }

            // Đếm tổng số records
            const countQuery = `SELECT COUNT(*) as total FROM NGUOIDUNG WHERE 1=1`;
            let countQueryWithConditions = countQuery;
            const countParams = [];
            
            if (search && search.trim() !== '') {
                countQueryWithConditions += ` AND (HoTen LIKE ? OR Email LIKE ? OR TenDangNhap LIKE ? OR CCCD LIKE ?)`;
                const searchTerm = `%${search.trim()}%`;
                countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            if (role && role.trim() !== '') {
                countQueryWithConditions += ` AND VaiTro = ?`;
                countParams.push(role.trim());
            }

            if (status && status.trim() !== '') {
                countQueryWithConditions += ` AND TrangThai = ?`;
                countParams.push(status.trim());
            }

            const [totalResult] = await pool.execute(countQueryWithConditions, countParams);
            const total = totalResult[0].total;

            // Thêm sắp xếp và phân trang
            query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ${numLimit} OFFSET ${numOffset}`;

            const [rows] = await pool.execute(query, queryParams);

            return {
                success: true,
                data: {
                    users: rows,
                    total,
                    limit: numLimit,
                    offset: numOffset
                }
            };

        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách người dùng',
                error: error.message
            };
        }
    }

    // [GET] Lấy người dùng theo ID
    static async findById(id) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(`
                SELECT MaNguoiDung, CCCD, TenDangNhap, HoTen, Email, SoDienThoai, VaiTro, TrangThai, NgayTao 
                FROM NGUOIDUNG 
                WHERE MaNguoiDung = ?
            `, [id]);

            if (rows.length === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy người dùng'
                };
            }

            return {
                success: true,
                data: rows[0]
            };

        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin người dùng',
                error: error.message
            };
        }
    }

    // [POST] Tạo người dùng mới
    static async create(userData) {
        try {
            const {
                CCCD,
                TenDangNhap,
                MatKhau,
                HoTen,
                Email,
                SoDienThoai,
                VaiTro = 'nguoithue',
                TrangThai = 'hoatdong'
            } = userData;

            // Validate required fields
            if (!CCCD || CCCD.trim() === '') {
                return {
                    success: false,
                    message: 'CCCD là bắt buộc'
                };
            }

            if (!TenDangNhap || TenDangNhap.trim() === '') {
                return {
                    success: false,
                    message: 'Tên đăng nhập là bắt buộc'
                };
            }

            if (!MatKhau || MatKhau.trim() === '') {
                return {
                    success: false,
                    message: 'Mật khẩu là bắt buộc'
                };
            }

            if (!HoTen || HoTen.trim() === '') {
                return {
                    success: false,
                    message: 'Họ tên là bắt buộc'
                };
            }

            if (!Email || Email.trim() === '') {
                return {
                    success: false,
                    message: 'Email là bắt buộc'
                };
            }

            // Validate CCCD format (12 digits)
            if (!/^\d{12}$/.test(CCCD)) {
                return {
                    success: false,
                    message: 'CCCD phải có đúng 12 chữ số'
                };
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(Email)) {
                return {
                    success: false,
                    message: 'Email không hợp lệ'
                };
            }

            // Validate phone number format
            if (SoDienThoai && !/^[0-9]{10,11}$/.test(SoDienThoai)) {
                return {
                    success: false,
                    message: 'Số điện thoại phải có 10-11 chữ số'
                };
            }

            const pool = db.getPool();

            // Kiểm tra trùng lặp
            const [existingUsers] = await pool.execute(`
                SELECT MaNguoiDung FROM NGUOIDUNG 
                WHERE CCCD = ? OR TenDangNhap = ? OR Email = ?
            `, [CCCD, TenDangNhap, Email]);

            if (existingUsers.length > 0) {
                return {
                    success: false,
                    message: 'CCCD, tên đăng nhập hoặc email đã tồn tại'
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(MatKhau, 10);

            const [result] = await pool.execute(`
                INSERT INTO NGUOIDUNG (CCCD, TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, VaiTro, TrangThai) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [CCCD, TenDangNhap, hashedPassword, HoTen, Email, SoDienThoai, VaiTro, TrangThai]);

            return {
                success: true,
                data: {
                    MaNguoiDung: result.insertId,
                    insertId: result.insertId
                },
                message: 'Tạo người dùng thành công'
            };

        } catch (error) {
            console.error('Lỗi khi tạo người dùng:', error);
            return {
                success: false,
                message: 'Lỗi khi tạo người dùng',
                error: error.message
            };
        }
    }

    // [PUT] Cập nhật người dùng
    static async update(id, userData) {
        try {
            const pool = db.getPool();
            
            // Lọc ra các field có thể cập nhật
            const allowedFields = ['CCCD', 'TenDangNhap', 'HoTen', 'Email', 'SoDienThoai', 'VaiTro', 'TrangThai'];
            const updateFields = [];
            const updateValues = [];

            for (const [key, value] of Object.entries(userData)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    // Validate specific fields
                    if (key === 'CCCD' && !/^\d{12}$/.test(value)) {
                        return {
                            success: false,
                            message: 'CCCD phải có đúng 12 chữ số'
                        };
                    }

                    if (key === 'Email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            return {
                                success: false,
                                message: 'Email không hợp lệ'
                            };
                        }
                    }

                    if (key === 'SoDienThoai' && value && !/^[0-9]{10,11}$/.test(value)) {
                        return {
                            success: false,
                            message: 'Số điện thoại phải có 10-11 chữ số'
                        };
                    }

                    updateFields.push(`${key} = ?`);
                    updateValues.push(value);
                }
            }

            // Cập nhật mật khẩu nếu có
            if (userData.MatKhau && userData.MatKhau.trim() !== '') {
                const hashedPassword = await bcrypt.hash(userData.MatKhau, 10);
                updateFields.push('MatKhau = ?');
                updateValues.push(hashedPassword);
            }

            if (updateFields.length === 0) {
                return {
                    success: false,
                    message: 'Không có dữ liệu để cập nhật'
                };
            }

            // Kiểm tra trùng lặp (trừ user hiện tại)
            if (userData.CCCD || userData.TenDangNhap || userData.Email) {
                let checkQuery = 'SELECT MaNguoiDung FROM NGUOIDUNG WHERE MaNguoiDung != ? AND (';
                const checkParams = [id];
                const conditions = [];

                if (userData.CCCD) {
                    conditions.push('CCCD = ?');
                    checkParams.push(userData.CCCD);
                }
                if (userData.TenDangNhap) {
                    conditions.push('TenDangNhap = ?');
                    checkParams.push(userData.TenDangNhap);
                }
                if (userData.Email) {
                    conditions.push('Email = ?');
                    checkParams.push(userData.Email);
                }

                checkQuery += conditions.join(' OR ') + ')';
                
                const [existingUsers] = await pool.execute(checkQuery, checkParams);
                if (existingUsers.length > 0) {
                    return {
                        success: false,
                        message: 'CCCD, tên đăng nhập hoặc email đã tồn tại'
                    };
                }
            }

            updateValues.push(id);
            const query = `UPDATE NGUOIDUNG SET ${updateFields.join(', ')} WHERE MaNguoiDung = ?`;

            const [result] = await pool.execute(query, updateValues);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy người dùng để cập nhật'
                };
            }

            return {
                success: true,
                message: 'Cập nhật người dùng thành công'
            };

        } catch (error) {
            console.error('Lỗi khi cập nhật người dùng:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật người dùng',
                error: error.message
            };
        }
    }

    // [DELETE] Xóa người dùng
    static async delete(id) {
        try {
            const pool = db.getPool();

            // Kiểm tra xem người dùng có đang sở hữu phòng không
            const [rooms] = await pool.execute(
                'SELECT COUNT(*) as count FROM PHONG WHERE MaChuNha = ?',
                [id]
            );

            if (rooms[0].count > 0) {
                return {
                    success: false,
                    message: 'Không thể xóa người dùng đang sở hữu phòng'
                };
            }

            // Kiểm tra xem người dùng có hợp đồng đang hiệu lực không
            const [contracts] = await pool.execute(
                'SELECT COUNT(*) as count FROM HOPDONG WHERE MaNguoiThue = ? AND TrangThai = "dangThue"',
                [id]
            );

            if (contracts[0].count > 0) {
                return {
                    success: false,
                    message: 'Không thể xóa người dùng đang có hợp đồng thuê'
                };
            }

            const [result] = await pool.execute('DELETE FROM NGUOIDUNG WHERE MaNguoiDung = ?', [id]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy người dùng để xóa'
                };
            }

            return {
                success: true,
                message: 'Xóa người dùng thành công'
            };

        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            return {
                success: false,
                message: 'Lỗi khi xóa người dùng',
                error: error.message
            };
        }
    }

    // [GET] Statistics
    static async getStats() {
        try {
            const pool = db.getPool();

            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as totalUsers,
                    SUM(CASE WHEN VaiTro = 'chunha' THEN 1 ELSE 0 END) as ownersCount,
                    SUM(CASE WHEN VaiTro = 'nguoithue' THEN 1 ELSE 0 END) as tenantsCount,
                    SUM(CASE WHEN VaiTro = 'admin' THEN 1 ELSE 0 END) as adminsCount,
                    SUM(CASE WHEN TrangThai = 'hoatdong' THEN 1 ELSE 0 END) as activeUsers,
                    SUM(CASE WHEN TrangThai = 'bikhoa' THEN 1 ELSE 0 END) as blockedUsers,
                    SUM(CASE WHEN DATE(NgayTao) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as newUsersCount
                FROM NGUOIDUNG
            `);

            return {
                success: true,
                data: stats[0]
            };

        } catch (error) {
            console.error('Error in User.getStats:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê'
            };
        }
    }

    // [PUT] Bulk update status
    static async bulkUpdateStatus(userIds, status) {
        try {
            const pool = db.getPool();

            if (!userIds || userIds.length === 0) {
                return {
                    success: false,
                    message: 'Danh sách người dùng không được trống'
                };
            }

            // Validate status
            const validStatuses = ['hoatdong', 'khonghoatdong', 'bikhoa'];
            if (!validStatuses.includes(status)) {
                return {
                    success: false,
                    message: 'Trạng thái không hợp lệ'
                };
            }

            const placeholders = userIds.map(() => '?').join(',');
            const query = `UPDATE NGUOIDUNG SET TrangThai = ? WHERE MaNguoiDung IN (${placeholders})`;
            const params = [status, ...userIds];

            const [result] = await pool.execute(query, params);

            return {
                success: true,
                data: {
                    updatedCount: result.affectedRows,
                    message: `Cập nhật trạng thái cho ${result.affectedRows} người dùng`
                }
            };

        } catch (error) {
            console.error('Error in User.bulkUpdateStatus:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật hàng loạt'
            };
        }
    }
}

module.exports = User; 