const mysql = require('mysql2/promise');

let pool = null;

async function connect() {
    try {
        pool = mysql.createPool({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'Htu0404@',
            database: 'RentalManagement',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        // Test the connection
        await pool.query('SELECT 1');
        console.log('Kết nối đến MySQL thành công!');
    } catch (error) {
        console.log('Lỗi khi kết nối đến MySQL:', error);
        process.exit(1);
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Pool chưa được khởi tạo. Vui lòng gọi hàm connect() trước.');
    }
    return pool;
}

module.exports = { connect, getPool };