const db = require("../../config/db");
const bcrypt = require("bcrypt");

class User {
    // Tìm user theo tên đăng nhập (cho authentication)
    static async findByUsername(username) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(
                'select * from users where username = ? and status = "active"',
                [username]
            );
            return rows[0] || null;
        } catch (error) {
            console.error("Lỗi khi tìm user:", error);
            throw error;
        }
    }

    // Đổi pass (cho authentication)
    static async changePassword(id, newPassword) {
        try {
            const pool = db.getPool();
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const [result] = await pool.execute(
                "update users set password = ? where userID = ?",
                [hashedPassword, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error);
            throw error;
        }
    }

    // Lấy tất cả người dùng 
    static async findAll() {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(`
                SELECT userID, nationalID, username, fullName, email, phoneNumber, role, status, createdAt 
                FROM users 
                ORDER BY createdAt DESC
            `);

            return {
                success: true,
                data: { users: rows }
            };
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            return {
                success: false,
                message: "Lỗi khi lấy danh sách người dùng"
            };
        }
    }

    // Lấy người dùng theo ID
    static async findById(id) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(
                `
            select userID, nationalID, username, fullName, email, phoneNumber, role, status, createdAt 
            from users 
            where userID = ?
        `,
                [id]
            );

            if (rows.length === 0) {
                return { success: false, message: "Không tìm thấy người dùng" };
            }

            return { success: true, data: rows[0] };
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            return { success: false, message: "Lỗi khi lấy thông tin người dùng" };
        }
    }

    // Tạo người dùng mới
    static async create(userData) {
        try {
            const {
                nationalID,
                username,
                password,
                fullName,
                email,
                phoneNumber,
                role = "user",
                status = "active",
            } = userData;

            // Validate
            if (!nationalID || !username || !password || !fullName || !email) {
                return { success: false, message: "Thiếu thông tin bắt buộc" };
            }

            const pool = db.getPool();

            // Kiểm tra trùng lặp
            const [existing] = await pool.execute(
                "select userID from users where nationalID = ? or username = ? or email = ?",
                [nationalID, username, email]
            );

            if (existing.length > 0) {
                return {
                    success: false,
                    message: "CCCD, tên đăng nhập hoặc email đã tồn tại",
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const [result] = await pool.execute(
                `
            insert into users (nationalID, username, password, fullName, email, phoneNumber, role, status) 
            values (?, ?, ?, ?, ?, ?, ?, ?)
        `,
                [
                    nationalID,
                    username,
                    hashedPassword,
                    fullName,
                    email,
                    phoneNumber,
                    role,
                    status,
                ]
            );

            return {
                success: true,
                data: { userID: result.insertId },
                message: "Tạo người dùng thành công",
            };
        } catch (error) {
            console.error("Lỗi khi tạo người dùng:", error);
            return { success: false, message: "Lỗi khi tạo người dùng" };
        }
    }

    // Cập nhật người dùng
    static async update(id, userData) {
        try {
            const pool = db.getPool();
            const { nationalID, username, fullName, email, phoneNumber, role, status } = userData;

            // Kiểm tra trùng lặp (trừ user hiện tại)
            const [existing] = await pool.execute(
                'select userID from users where userID != ? and (nationalID = ? or username = ? or email = ?)',
                [id, nationalID, username, email]
            );

            if (existing.length > 0) {
                return { success: false, message: 'CCCD, tên đăng nhập hoặc email đã tồn tại' };
            }

            const [result] = await pool.execute(`
                update users 
                set nationalID = ?, username = ?, fullName = ?, email = ?, phoneNumber = ?, role = ?, status = ?
                where userID = ?
            `, [nationalID, username, fullName, email, phoneNumber, role, status, id]);

            if (result.affectedRows === 0) {
                return { success: false, message: 'Không tìm thấy người dùng để cập nhật' };
            }

            return { success: true, message: 'Cập nhật người dùng thành công' };
        } catch (error) {
            console.error('Lỗi khi cập nhật người dùng:', error);
            return { success: false, message: 'Lỗi khi cập nhật người dùng' };
        }
    }

    // Xóa người dùng
    static async delete(id) {
        try {
            const pool = db.getPool();

            const [result] = await pool.execute(
                "delete from users where userID = ?",
                [id]
            );

            if (result.affectedRows === 0) {
                return { success: false, message: "Không tìm thấy người dùng để xóa" };
            }

            return { success: true, message: "Xóa người dùng thành công" };
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            return { success: false, message: "Lỗi khi xóa người dùng" };
        }
    }

    // Thống kê đơn giản
    static async getStats() {
        try {
            const pool = db.getPool();
            const [stats] = await pool.execute(`
            select 
                count(*) as totalUsers,
                sum(case when role = 'admin' then 1 else 0 end) as adminsCount,
                sum(case when role = 'user' then 1 else 0 end) as usersCount,
                sum(case when status = 'active' then 1 else 0 end) as activeUsers
            from users
        `);

            return { success: true, data: stats[0] };
        } catch (error) {
            console.error("Error in User.getStats:", error);
            return { success: false, message: "Lỗi khi lấy thống kê" };
        }
    }

    // Thay đổi trạng thái hàng loạt
    static async bulkUpdateStatus(userIds, status) {
        try {
            const pool = db.getPool();
            
            if (!Array.isArray(userIds) || userIds.length === 0) {
                return { success: false, message: 'Danh sách người dùng không hợp lệ' };
            }

            const placeholders = userIds.map(() => '?').join(',');
            const [result] = await pool.execute(
                `UPDATE users SET status = ? WHERE userID IN (${placeholders})`,
                [status, ...userIds]
            );

            return {
                success: true,
                data: {
                    message: `Đã cập nhật trạng thái cho ${result.affectedRows} người dùng`,
                    affectedRows: result.affectedRows
                }
            };
        } catch (error) {
            console.error('Error in User.bulkUpdateStatus:', error);
            return { success: false, message: 'Lỗi khi cập nhật trạng thái hàng loạt' };
        }
    }
}

module.exports = User;
