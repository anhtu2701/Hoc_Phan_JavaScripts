const bcrypt = require('bcrypt');
const User = require('../models/User');

class LoginController {
    // [GET] /login - Hiển thị trang đăng nhập
    index(req, res) {
        res.render('login', { 
            title: 'Login to TingTong', 
            layout: false 
        });
    }

    // [POST] /login - Xử lý đăng nhập
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.render('login', { 
                    title: 'Login to TingTong', 
                    layout: false,
                    error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
                });
            }

            // Tìm user trong database
            const user = await User.findByUsername(username);
            
            if (!user) {
                return res.render('login', { 
                    title: 'Login to TingTong', 
                    layout: false,
                    error: 'Tên đăng nhập không tồn tại'
                });
            }

            // Kiểm tra trạng thái tài khoản
            if (user.status !== 'active') {
                return res.render('login', { 
                    title: 'Login to TingTong', 
                    layout: false,
                    error: 'Tài khoản của bạn đã bị khóa hoặc không hoạt động'
                });
            }

            // So sánh mật khẩu
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                return res.render('login', { 
                    title: 'Login to TingTong', 
                    layout: false,
                    error: 'Mật khẩu không chính xác'
                });
            }

            // Tạo session cho user
            req.session.user = {
                id: user.userID,
                username: user.username,
                role: user.role,
                name: user.fullName,
                email: user.email,
                phone: user.phoneNumber
            };

            // Redirect theo role
            if (user.role === 'admin') {
                return res.redirect('/dashboard');
            } else {
                return res.redirect('/');
            }

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            return res.render('login', { 
                title: 'Login to TingTong', 
                layout: false,
                error: 'Có lỗi xảy ra, vui lòng thử lại'
            });
        }
    }

    // [POST] /logout - Xử lý đăng xuất
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Lỗi khi đăng xuất:', err);
                return res.redirect('/');
            }
            
            // Xóa cookie session
            res.clearCookie('session_cookie_name');
            return res.redirect('/');
        });
    }
}

module.exports = new LoginController();