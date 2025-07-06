const db = require('../../config/db');

class User {
    // Tìm user theo tên đăng nhập
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

    // Tìm user theo ID
    static async findById(id) {
        try {
            const pool = db.getPool();
            const [rows] = await pool.execute(
                'SELECT * FROM NGUOIDUNG WHERE MaNguoiDung = ? AND TrangThai = "hoatdong"',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Lỗi khi tìm user theo ID:', error);
            throw error;
        }
    }

    // Tạo user mới (cho chức năng đăng ký sau này)
    static async create(userData) {
        try {
            const pool = db.getPool();
            const [result] = await pool.execute(
                'INSERT INTO NGUOIDUNG (CCCD, TenDangNhap, MatKhau, Email, SoDienThoai, HoTen, VaiTro, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userData.cccd, userData.username, userData.password, userData.email, userData.phone, userData.fullName, userData.role, 'hoatdong']
            );
            return result.insertId;
        } catch (error) {
            console.error('Lỗi khi tạo user:', error);
            throw error;
        }
    }

    // Cập nhật thông tin user
    static async update(id, userData) {
        try {
            const pool = db.getPool();
            const [result] = await pool.execute(
                'UPDATE NGUOIDUNG SET Email = ?, SoDienThoai = ?, HoTen = ? WHERE MaNguoiDung = ?',
                [userData.email, userData.phone, userData.fullName, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Lỗi khi cập nhật user:', error);
            throw error;
        }
    }

    // Đổi mật khẩu
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
}

module.exports = User; 