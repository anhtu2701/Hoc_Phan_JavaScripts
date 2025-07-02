class DashboardController {
    index(req, res) {
        res.render('dashboard', {
            layout: false
        });
    }
}

module.exports = new DashboardController();