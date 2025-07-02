class HomeController {
    // [GET] /
    index(req, res) {
        res.render('home', { title: 'Tingtong'})
    }
}

module.exports = new HomeController();