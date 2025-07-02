class DashboardController {
    index(req, res) {
        res.render('dashboard', {
            layout: 'dashboard',
            title: 'Dashboard Admin',
            pageCss: 'dashboard.css',
            isDashboard: true
        });
    }

    roomsManagement(req, res) {
        res.render('roomsManagement', {
            layout: 'dashboard',
            title: 'Rooms Management',
            pageCss: 'roomsManagement.css',
            isRooms: true
        });
    }

    usersManagement(req, res) {
        res.render('usersManagement', {
            layout: 'dashboard',
            title: 'Users Management',
            pageCss: 'usersManagement.css',
            isUsers: true
        });
    }
}

module.exports = new DashboardController();