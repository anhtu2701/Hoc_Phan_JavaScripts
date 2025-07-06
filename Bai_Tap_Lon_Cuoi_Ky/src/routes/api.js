const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Room = require('../app/models/Room');
const { requireAuth, requireAdmin } = require('../app/middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../app/models/User');

// Cấu hình multer để upload ảnh cuối cùng
const finalStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/img/houses');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const roomId = req.params.id;
        const extension = path.extname(file.originalname);
        cb(null, roomId.toLowerCase() + extension);
    }
});

// Cấu hình multer để upload ảnh tạm thời
const tempStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/temp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'temp-' + uniqueName + extension);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
};

const finalUpload = multer({ 
    storage: finalStorage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const tempUpload = multer({ 
    storage: tempStorage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// GET /api/rooms/stats - Lấy thống kê phòng (PHẢI ĐẶT TRƯỚC routes có :id)
router.get('/rooms/stats', async (req, res) => {
    try {
        const result = await Room.getStats();
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('Lỗi khi lấy thống kê phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// GET /api/rooms - Lấy danh sách phòng với filters và pagination
router.get('/rooms', async (req, res) => {
    try {
        const {
            limit = 20,
            offset = 0,
            status,
            min_price,
            max_price,
            search,
            sort_by,
            sort_order
        } = req.query;

        console.log('API Rooms query params:', req.query); // Debug log

        const options = {
            limit: parseInt(limit) || 20,
            offset: parseInt(offset) || 0,
            status,
            minPrice: min_price ? parseFloat(min_price) : '',
            maxPrice: max_price ? parseFloat(max_price) : '',
            search: search || '',
            sortBy: sort_by || 'MaPhong',
            sortOrder: sort_order || 'ASC'
        };

        console.log('Processed options:', options); // Debug log

        const result = await Room.findAll(options);
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// GET /api/rooms/:id - Lấy chi tiết một phòng
router.get('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Room.findById(id);
        
        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('Lỗi khi lấy thông tin phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// POST /api/rooms/:id/upload - Upload ảnh cho phòng
router.post('/rooms/:id/upload', requireAuth, finalUpload.single('roomImage'), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file ảnh được upload'
            });
        }

        // Kiểm tra quyền sở hữu phòng (nếu không phải admin)
        if (req.session.user.role !== 'admin') {
            const existingRoom = await Room.findById(id);
            if (!existingRoom.success) {
                return res.status(404).json(existingRoom);
            }
            
            if (existingRoom.data.MaChuNha !== req.session.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền upload ảnh cho phòng này'
                });
            }
        }

        // URL của ảnh mới
        const imageUrl = `/img/houses/${req.file.filename}`;

        // Cập nhật URL ảnh trong database
        const result = await Room.update(id, { URLAnhPhong: imageUrl });

        if (!result.success) {
            // Xóa file vừa upload nếu cập nhật DB thất bại
            fs.unlinkSync(req.file.path);
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            data: {
                imageUrl: imageUrl,
                message: 'Upload ảnh thành công'
            }
        });

    } catch (error) {
        console.error('Lỗi khi upload ảnh:', error);
        
        // Xóa file nếu có lỗi
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload ảnh'
        });
    }
});

// POST /api/rooms - Tạo phòng mới (cần authentication)
router.post('/rooms', requireAuth, async (req, res) => {
    try {
        const roomData = req.body;
        
        // Nếu không phải admin, set MaChuNha = current user
        if (req.session.user.role !== 'admin') {
            roomData.MaChuNha = req.session.user.id;
        }

        const result = await Room.create(roomData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json(result);

    } catch (error) {
        console.error('Lỗi khi tạo phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// PUT /api/rooms/:id - Cập nhật phòng (cần authentication)
router.put('/rooms/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const roomData = req.body;

        // Kiểm tra quyền sở hữu phòng (nếu không phải admin)
        if (req.session.user.role !== 'admin') {
            const existingRoom = await Room.findById(id);
            if (!existingRoom.success) {
                return res.status(404).json(existingRoom);
            }
            
            if (existingRoom.data.MaChuNha !== req.session.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền chỉnh sửa phòng này'
                });
            }
        }

        const result = await Room.update(id, roomData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('Lỗi khi cập nhật phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// DELETE /api/rooms/:id - Xóa phòng (cần authentication)
router.delete('/rooms/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra quyền sở hữu phòng (nếu không phải admin)
        if (req.session.user.role !== 'admin') {
            const existingRoom = await Room.findById(id);
            if (!existingRoom.success) {
                return res.status(404).json(existingRoom);
            }
            
            if (existingRoom.data.MaChuNha !== req.session.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền xóa phòng này'
                });
            }
        }

        const result = await Room.delete(id);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('Lỗi khi xóa phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// PUT /api/rooms/bulk - Cập nhật hàng loạt (admin only)
router.put('/rooms/bulk', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { roomIds, updateData } = req.body;

        if (!roomIds || !Array.isArray(roomIds)) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách mã phòng không hợp lệ'
            });
        }

        const pool = db.getPool();
        let updatedCount = 0;

        // Cập nhật từng phòng
        for (const roomId of roomIds) {
            const result = await Room.update(roomId, updateData);
            if (result.success) {
                updatedCount++;
            }
        }

        res.json({
            success: true,
            data: {
                totalRequested: roomIds.length,
                updated: updatedCount
            },
            message: `Đã cập nhật ${updatedCount}/${roomIds.length} phòng`
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật hàng loạt:', error);
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

// Upload ảnh tạm thời cho phòng chờ duyệt
router.post('/rooms/temp-upload', requireAuth, tempUpload.single('roomImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file được upload!' });
        }

        // Trả về đường dẫn tạm thời
        const tempImageUrl = `/uploads/temp/${req.file.filename}`;
        
        res.json({ 
            success: true, 
            message: 'Upload ảnh tạm thời thành công!',
            tempImageUrl: tempImageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Lỗi upload ảnh tạm thời:', error);
        
        // Xóa file nếu có lỗi
        if (req.file) {
            const filePath = req.file.path;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        res.status(500).json({ success: false, message: 'Lỗi server khi upload ảnh!' });
    }
});

// API để duyệt phòng và chuyển ảnh từ temp sang final (chỉ admin)
router.post('/rooms/:id/approve', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { tempImageUrl } = req.body;

        // Lấy thông tin phòng từ bảng PHONG_CHO_DUYET
        const [pendingRooms] = await db.execute(
            'SELECT * FROM PHONG_CHO_DUYET WHERE MaPhongChoDuyet = ?',
            [id]
        );

        if (pendingRooms.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chờ duyệt!' });
        }

        const pendingRoom = pendingRooms[0];

        // Tạo mã phòng mới
        const [maxRoom] = await db.execute('SELECT MaPhong FROM PHONG ORDER BY MaPhong DESC LIMIT 1');
        let newRoomId;
        if (maxRoom.length > 0) {
            const lastId = parseInt(maxRoom[0].MaPhong.replace('CT', ''));
            newRoomId = 'CT' + String(lastId + 1).padStart(4, '0');
        } else {
            newRoomId = 'CT0001';
        }

        // Di chuyển ảnh từ temp sang final với tên theo mã phòng
        let finalImageUrl = pendingRoom.URLAnhPhong;
        if (tempImageUrl) {
            const tempPath = path.join(__dirname, '../public', tempImageUrl);
            const extension = path.extname(tempImageUrl);
            const finalFilename = newRoomId.toLowerCase() + extension;
            const finalPath = path.join(__dirname, '../public/img/houses', finalFilename);

            if (fs.existsSync(tempPath)) {
                // Tạo thư mục đích nếu chưa có
                const finalDir = path.dirname(finalPath);
                if (!fs.existsSync(finalDir)) {
                    fs.mkdirSync(finalDir, { recursive: true });
                }

                // Di chuyển file
                fs.renameSync(tempPath, finalPath);
                finalImageUrl = `/img/houses/${finalFilename}`;
            }
        }

        // Thêm phòng vào bảng PHONG
        await db.execute(
            `INSERT INTO PHONG (MaPhong, MaChuNha, TieuDe, MoTa, URLAnhPhong, DienTich, GiaThue, TrangThai, DiaChi) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'conTrong', ?)`,
            [newRoomId, pendingRoom.MaChuNha, pendingRoom.TieuDe, pendingRoom.MoTa, 
             finalImageUrl, pendingRoom.DienTich, pendingRoom.GiaThue, pendingRoom.DiaChi]
        );

        // Cập nhật trạng thái trong bảng PHONG_CHO_DUYET
        await db.execute(
            'UPDATE PHONG_CHO_DUYET SET TrangThai = "daDuyet", MaPhong = ? WHERE MaPhongChoDuyet = ?',
            [newRoomId, id]
        );

        res.json({ 
            success: true, 
            message: 'Duyệt phòng thành công!',
            roomId: newRoomId,
            finalImageUrl: finalImageUrl
        });

    } catch (error) {
        console.error('Lỗi duyệt phòng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi duyệt phòng!' });
    }
});

// API để từ chối phòng và xóa ảnh tạm thời (chỉ admin)
router.post('/rooms/:id/reject', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Lấy thông tin phòng
        const [pendingRooms] = await db.execute(
            'SELECT * FROM PHONG_CHO_DUYET WHERE MaPhongChoDuyet = ?',
            [id]
        );

        if (pendingRooms.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chờ duyệt!' });
        }

        const pendingRoom = pendingRooms[0];

        // Xóa ảnh tạm thời nếu có
        if (pendingRoom.URLAnhPhong && pendingRoom.URLAnhPhong.includes('/uploads/temp/')) {
            const tempPath = path.join(__dirname, '../public', pendingRoom.URLAnhPhong);
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }

        // Cập nhật trạng thái từ chối
        await db.execute(
            'UPDATE PHONG_CHO_DUYET SET TrangThai = "tuChoi", GhiChu = ? WHERE MaPhongChoDuyet = ?',
            [reason || 'Phòng không đạt yêu cầu', id]
        );

        res.json({ 
            success: true, 
            message: 'Đã từ chối phòng thành công!'
        });

    } catch (error) {
        console.error('Lỗi từ chối phòng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi từ chối phòng!' });
    }
});

// [GET] Lấy thống kê người dùng
router.get('/users/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        const result = await User.getStats();
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in /api/users/stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// [GET] Lấy danh sách người dùng với phân trang và bộ lọc
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            role = '',
            status = '',
            sortBy = 'NgayTao',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const options = {
            limit: parseInt(limit),
            offset,
            search,
            role,
            status,
            sortBy,
            sortOrder
        };

        const result = await User.findAll(options);
        
        if (result.success) {
            const totalPages = Math.ceil(result.data.total / parseInt(limit));
            
            res.json({
                success: true,
                data: {
                    users: result.data.users,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalItems: result.data.total,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in /api/users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// [GET] Lấy thông tin người dùng theo ID
router.get('/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await User.findById(id);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(404).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in /api/users/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// [POST] Tạo người dùng mới
router.post('/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const userData = req.body;
        
        const result = await User.create(userData);
        
        if (result.success) {
            res.status(201).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in POST /api/users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// [PUT] Cập nhật người dùng (chỉ trạng thái và vai trò)
router.put('/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { TrangThai, VaiTro } = req.body;
        
        // Admin chỉ có thể thay đổi trạng thái và vai trò
        const allowedUpdates = {};
        if (TrangThai !== undefined) allowedUpdates.TrangThai = TrangThai;
        if (VaiTro !== undefined) allowedUpdates.VaiTro = VaiTro;
        
        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có thông tin hợp lệ để cập nhật'
            });
        }
        
        const result = await User.update(id, allowedUpdates);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in PUT /api/users/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// [DELETE] Xóa người dùng
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await User.delete(id);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in DELETE /api/users/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// [PUT] Cập nhật trạng thái hàng loạt
router.put('/users/bulk/status', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { userIds, status } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách người dùng không hợp lệ'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không được để trống'
            });
        }
        
        const result = await User.bulkUpdateStatus(userIds, status);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: result.data.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in PUT /api/users/bulk/status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

module.exports = router; 