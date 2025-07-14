// Middleware kiểm tra user đã đăng nhập chưa
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

// Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).render('error', { 
            title: 'Không có quyền truy cập',
            message: 'Bạn không có quyền truy cập vào trang này.',
            layout: false
        });
    }
}

// Middleware kiểm tra user đã đăng nhập thì không cho vào trang login
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/dashboard');
        } else {
            return res.redirect('/');
        }
    } else {
        // User chưa đăng nhập, cho phép vào trang login
        return next();
    }
}

// Middleware để thêm thông tin user vào tất cả các view
function addUserToViews(req, res, next) {
    res.locals.user = req.session.user || null;
    next();
}

module.exports = {
    requireAuth,
    requireAdmin,
    redirectIfAuthenticated,
    addUserToViews
}; 