class DashboardController {
    index(req, res) {
        res.render("dashboard", {
            layout: "dashboard",
            title: "Dashboard Admin",
            pageCss: "dashboard.css",
            isDashboard: true,
        });
    }

    roomsManagement(req, res) {
        res.render("roomsManagement", {
            layout: "dashboard",
            title: "Rooms Management",
            pageCss: "roomsManagement.css",
            isRooms: true,
        });
    }

    usersManagement(req, res) {
        res.render("usersManagement", {
            layout: "dashboard",
            title: "Users Management",
            pageCss: "usersManagement.css",
            isUsers: true,
        });
    }

    // [GET] /api/dashboard/stats - Thống kê tổng quan
    async getStats(req, res) {
        try {
            const pool = db.getPool();

            // Lấy thống kê cơ bản
            const [stats] = await pool.execute(`
                    SELECT 
                        (SELECT COUNT(*) FROM NGUOIDUNG) as totalUsers,
                        (SELECT COUNT(*) FROM PHONG) as totalRooms,
                        (SELECT COUNT(*) FROM HOPDONG WHERE TrangThai = 'dangThue') as activeContracts,
                        (SELECT COUNT(*) FROM PHONG WHERE TrangThai = 'conTrong') as availableRooms,
                        (SELECT COUNT(*) FROM PHONG WHERE TrangThai = 'dangThue') as occupiedRooms,
                        (SELECT COUNT(*) FROM NGUOIDUNG WHERE MONTH(NgayTao) = MONTH(CURDATE())) as newUsersThisMonth
                `);

            // Doanh thu tháng này
            const [revenue] = await pool.execute(`
                    SELECT COALESCE(SUM(SoTien), 0) as monthlyRevenue 
                    FROM THANHTOAN 
                    WHERE MONTH(NgayThanhToan) = MONTH(CURDATE()) 
                    AND YEAR(NgayThanhToan) = YEAR(CURDATE())
                    AND TrangThai = 'daThanhToan'
                `);

            const data = stats[0];
            data.monthlyRevenue = revenue[0].monthlyRevenue;

            // Tính tỷ lệ lấp đầy
            const total = data.availableRooms + data.occupiedRooms;
            data.occupancyRate =
                total > 0 ? Math.round((data.occupiedRooms / total) * 100) : 0;

            res.json({ success: true, data });
        } catch (error) {
            console.error("Lỗi lấy thống kê dashboard:", error);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

    // [GET] /api/dashboard/pending-rooms
    async getPendingRooms(req, res) {
        try {
            const pool = db.getPool();
            const [rooms] = await pool.execute(`
                    SELECT p.*, n.HoTen as TenChuNha 
                    FROM PHONG p 
                    LEFT JOIN NGUOIDUNG n ON p.MaChuNha = n.MaNguoiDung 
                    WHERE p.TrangThai = 'dangChoDuyet' 
                    ORDER BY p.NgayTao DESC 
                    LIMIT 10
                `);

            res.json({ success: true, data: rooms });
        } catch (error) {
            console.error("Lỗi lấy phòng chờ duyệt:", error);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

    // [GET] /api/dashboard/recent-contracts
    async getRecentContracts(req, res) {
        try {
            const pool = db.getPool();
            const [contracts] = await pool.execute(`
                    SELECT h.MaHopDong, h.MaPhong, h.NgayBatDau, h.TrangThai,
                           n.HoTen as TenNguoiThue, p.TieuDe as TenPhong
                    FROM HOPDONG h
                    LEFT JOIN NGUOIDUNG n ON h.MaNguoiThue = n.MaNguoiDung  
                    LEFT JOIN PHONG p ON h.MaPhong = p.MaPhong
                    WHERE h.TrangThai IN ('dangThue', 'choDuyet')
                    ORDER BY h.NgayTao DESC
                    LIMIT 8
                `);

            res.json({ success: true, data: contracts });
        } catch (error) {
            console.error("Lỗi lấy hợp đồng gần đây:", error);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

    // [GET] /api/dashboard/revenue-chart
    async getRevenueChart(req, res) {
        try {
            const pool = db.getPool();
            const [data] = await pool.execute(`
                    SELECT 
                        DATE_FORMAT(NgayThanhToan, '%Y-%m') as month,
                        SUM(SoTien) as revenue
                    FROM THANHTOAN 
                    WHERE NgayThanhToan >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                    AND TrangThai = 'daThanhToan'
                    GROUP BY DATE_FORMAT(NgayThanhToan, '%Y-%m')
                    ORDER BY month ASC
                `);

            // Format data cho chart
            const months = [];
            const revenue = [];

            data.forEach((item) => {
                const [year, month] = item.month.split("-");
                months.push(`Tháng ${month}/${year}`);
                revenue.push(item.revenue);
            });

            res.json({
                success: true,
                data: { months, revenue },
            });
        } catch (error) {
            console.error("Lỗi lấy dữ liệu biểu đồ:", error);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

    // [GET] /api/dashboard/room-status-chart
    async getRoomStatusChart(req, res) {
        try {
            const pool = db.getPool();
            const [data] = await pool.execute(`
                    SELECT 
                        TrangThai,
                        COUNT(*) as count
                    FROM PHONG 
                    GROUP BY TrangThai
                `);

            const statusData = {
                available: 0,
                occupied: 0,
                pending: 0,
                approved: 0,
            };

            data.forEach((item) => {
                switch (item.TrangThai) {
                    case "conTrong":
                        statusData.available = item.count;
                        break;
                    case "dangThue":
                        statusData.occupied = item.count;
                        break;
                    case "dangChoDuyet":
                        statusData.pending = item.count;
                        break;
                    case "daDuyet":
                        statusData.approved = item.count;
                        break;
                }
            });

            res.json({ success: true, data: statusData });
        } catch (error) {
            console.error("Lỗi lấy trạng thái phòng:", error);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }
}

module.exports = new DashboardController();
