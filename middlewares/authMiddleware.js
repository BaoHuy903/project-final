const requireAuth = (req, res, next) => { // kiểm tra xác thực người dùng
    if (!req.session.userId) {
        return res.redirect('/users/login');
    }
    next();
};

module.exports = { requireAuth };