// Middleware kiểm tra user đã đăng nhập chưa
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        // User đã đăng nhập, cho phép tiếp tục
        return next();
    } else {
        // User chưa đăng nhập, redirect về login
        return res.redirect('/login');
    }
}

// Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        // User có quyền admin, cho phép tiếp tục
        return next();
    } else {
        // User không có quyền admin
        return res.status(403).render('error', { 
            title: 'Không có quyền truy cập',
            message: 'Bạn không có quyền truy cập vào trang này.',
            layout: false
        });
    }
}

// Middleware kiểm tra quyền chủ nhà
function requireLandlord(req, res, next) {
    if (req.session && req.session.user && 
        (req.session.user.role === 'chunha' || req.session.user.role === 'admin')) {
        return next();
    } else {
        return res.status(403).render('error', { 
            title: 'Không có quyền truy cập',
            message: 'Bạn cần là chủ nhà để truy cập trang này.',
            layout: false
        });
    }
}

// Middleware kiểm tra user đã đăng nhập thì không cho vào trang login
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // User đã đăng nhập
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
    requireLandlord,
    redirectIfAuthenticated,
    addUserToViews
}; 