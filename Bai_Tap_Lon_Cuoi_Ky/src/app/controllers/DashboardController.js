class DashboardController {
    index(req, res) {
        res.render('dashboard', {
            layout: 'dashboard',
            title: 'Dashboard Admin',
            pageCss: 'dashboard.css'
        });
    }

    roomsManagement(req, res) {
        res.render('roomsManagement', {
            layout: 'dashboard',
            title: 'Rooms Management',
            pageCss: 'roomsManagement.css'
        });
    }

    usersManagement(req, res) {
        res.render('usersManagement', {
            layout: 'dashboard',
            title: 'Users Management',
            pageCss: 'usersManagement.css'
        });
    }
}

module.exports = new DashboardController();