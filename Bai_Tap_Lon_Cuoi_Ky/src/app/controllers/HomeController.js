const Room = require('../models/Room');

class HomeController {
    // [GET] / - Trang chủ hiển thị danh sách phòng
    async index(req, res) {
        try {
            res.render('home', { 
                title: 'Tingtong - Hệ thống đặt lịch xem phòng trọ',
                user: req.session.user || null
            });
        } catch (error) {
            console.error('Error in HomeController.index:', error);
            res.render('home', { 
                title: 'Tingtong',
                error: 'Có lỗi xảy ra',
                user: req.session.user || null
            });
        }
    }

    // [GET] /room/:id - Chi tiết phòng
    async roomDetail(req, res) {
        try {
            const { id } = req.params;
            const result = await Room.findById(id);
            
            if (result.success) {
                res.render('roomDetail', { 
                    title: `${result.data.title} - Tingtong`,
                    room: result.data,
                    user: req.session.user || null
                });
            } else {
                res.status(404).render('error', { 
                    title: 'Không tìm thấy phòng',
                    message: result.message,
                    layout: false
                });
            }
        } catch (error) {
            console.error('Error in HomeController.roomDetail:', error);
            res.status(500).render('error', { 
                title: 'Lỗi server',
                message: 'Có lỗi xảy ra khi tải thông tin phòng',
                layout: false
            });
        }
    }
}

module.exports = new HomeController();