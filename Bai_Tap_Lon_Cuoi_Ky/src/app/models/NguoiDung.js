const db = require('../../config/db');

class NguoiDung {
    static async getAll() {
        const pool = db.getPool();
        const [rows] = await pool.query('SELECT * FROM NGUOIDUNG');
        return rows;
    }
}

module.exports = NguoiDung;