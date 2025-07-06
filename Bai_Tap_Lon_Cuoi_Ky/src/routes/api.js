const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/rooms - Lấy danh sách phòng
router.get('/rooms', async (req, res) => {
    try {
        const { limit = 20, status = 'conTrong', min_price, max_price } = req.query;
        const pool = db.getPool();
        
        // Validate and parse limit
        const parsedLimit = parseInt(limit);
        const validLimit = isNaN(parsedLimit) || parsedLimit <= 0 ? 20 : Math.min(parsedLimit, 100);
        
        // Build query with filters
        let query = 'SELECT * FROM PHONG WHERE TrangThai = ?';
        let params = [status];
        
        // Add price filter using BETWEEN (cleaner approach)
        if (min_price && max_price) {
            const minPrice = parseInt(min_price);
            const maxPrice = parseInt(max_price);
            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                query += ' AND GiaThue BETWEEN ? AND ?';
                params.push(minPrice, maxPrice);
            }
        } else if (min_price) {
            const minPrice = parseInt(min_price);
            if (!isNaN(minPrice)) {
                query += ' AND GiaThue >= ?';
                params.push(minPrice);
            }
        } else if (max_price) {
            const maxPrice = parseInt(max_price);
            if (!isNaN(maxPrice)) {
                query += ' AND GiaThue <= ?';
                params.push(maxPrice);
            }
        }
        
        // Add ORDER BY for price sorting (ascending)
        query += ' ORDER BY GiaThue ASC';
        
        // Add LIMIT using template literal (NOT as parameter to avoid SQL error)
        query += ` LIMIT ${validLimit}`;
        
        const [rooms] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rooms,
            total: rooms.length
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// GET /api/dashboard/stats - Lấy thống kê dashboard
router.get('/dashboard/stats', async (req, res) => {
    try {
        const pool = db.getPool();
        
        // Lấy tổng số người dùng
        const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM NGUOIDUNG');
        
        // Lấy tổng số phòng
        const [totalRooms] = await pool.execute('SELECT COUNT(*) as count FROM PHONG');
        
        // Lấy số hợp đồng đang hiệu lực
        const [activeContracts] = await pool.execute('SELECT COUNT(*) as count FROM HOPDONG WHERE TrangThai = "dangThue"');
        
        // Lấy doanh thu tháng này
        const [monthlyRevenue] = await pool.execute(`
            SELECT COALESCE(SUM(SoTien), 0) as revenue 
            FROM THANHTOAN 
            WHERE MONTH(NgayThanhToan) = MONTH(CURRENT_DATE()) 
            AND YEAR(NgayThanhToan) = YEAR(CURRENT_DATE())
            AND TrangThai = 'daThanhToan'
        `);
        
        res.json({
            success: true,
            data: {
                totalUsers: totalUsers[0].count,
                totalRooms: totalRooms[0].count,
                activeContracts: activeContracts[0].count,
                monthlyRevenue: monthlyRevenue[0].revenue
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// GET /api/dashboard/pending-rooms - Lấy danh sách phòng chờ duyệt
router.get('/dashboard/pending-rooms', async (req, res) => {
    try {
        const pool = db.getPool();
        
        const [pendingRooms] = await pool.execute(`
            SELECT 
                pcd.MaPhongChoDuyet,
                pcd.MaPhong,
                pcd.MaChuNha,
                pcd.TieuDe,
                pcd.DiaChi,
                pcd.GiaThue,
                pcd.NgayTao,
                nd.HoTen as TenChuNha
            FROM PHONG_CHO_DUYET pcd
            JOIN NGUOIDUNG nd ON pcd.MaChuNha = nd.MaNguoiDung
            ORDER BY pcd.NgayTao DESC
        `);
        
        res.json({
            success: true,
            data: pendingRooms
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng chờ duyệt:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

module.exports = router; 