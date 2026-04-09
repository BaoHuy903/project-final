const requireAuth = (req, res, next) => {
    // Nếu chưa có session (chưa đăng nhập), đẩy về trang login
    if (!req.session.userId) {
        return res.redirect('/users/login');
    }
    // Nếu đã đăng nhập, cho phép đi tiếp
    next();
};

module.exports = { requireAuth };