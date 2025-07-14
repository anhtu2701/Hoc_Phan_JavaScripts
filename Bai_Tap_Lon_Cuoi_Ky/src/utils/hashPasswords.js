const bcrypt = require('bcrypt');
const db = require('../config/db');

async function hashExistingPasswords() {
    try {
        await db.connect();
        const pool = db.getPool();
        
        // Lấy tất cả user có mật khẩu chưa hash
        const [users] = await pool.execute('SELECT MaNguoiDung, MatKhau FROM NGUOIDUNG');
        
        console.log(`Tìm thấy ${users.length} user cần hash mật khẩu...`);
        
        for (const user of users) {
            // Kiểm tra xem mật khẩu đã được hash chưa
            if (!user.MatKhau.startsWith('$2b$')) {
                console.log(`Đang hash mật khẩu cho user ID: ${user.MaNguoiDung}`);
                
                // Hash mật khẩu
                const hashedPassword = await bcrypt.hash(user.MatKhau, 10);
                
                // Cập nhật lại database
                await pool.execute(
                    'UPDATE NGUOIDUNG SET MatKhau = ? WHERE MaNguoiDung = ?',
                    [hashedPassword, user.MaNguoiDung]
                );
                
                console.log(`Đã hash mật khẩu cho user ID: ${user.MaNguoiDung}`);
            } else {
                console.log(`User ID ${user.MaNguoiDung} đã có mật khẩu hash`);
            }
        }
        
        console.log('Hoàn thành hash tất cả mật khẩu!');
        process.exit(0);
        
    } catch (error) {
        console.error('Lỗi khi hash mật khẩu:', error);
        process.exit(1);
    }
}

// Chạy script
hashExistingPasswords(); 