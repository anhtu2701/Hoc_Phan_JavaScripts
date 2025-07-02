class DashboardController {
    index(req, res) {
        res.render('dashboard', {
            layout: false
        });
    }

    roomsManagement(req, res) {
        res.render('roomsManagement', {
            layout: false
        });
    }

    usersManagement(req, res) {
        res.render('usersManagement', {
            layout: false
        });
    }
}

module.exports = new DashboardController();