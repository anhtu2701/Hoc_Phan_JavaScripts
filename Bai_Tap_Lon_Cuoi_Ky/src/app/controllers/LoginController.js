
class LoginController {
    //  [GET] /login
    index(req, res) {
        res.render('login', { title: 'Login to TingTong', layout: false });
    }
}

module.exports = new LoginController();