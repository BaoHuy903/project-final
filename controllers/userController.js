const User = require('../models/user');
const bcrypt = require('bcryptjs');

// [GET] Trang đăng ký
exports.getRegister = (req, res) => {
    res.render('users/register', { error: null });
};

// [POST] Xử lý đăng ký
exports.postRegister = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('users/register', { error: 'Tên đăng nhập đã tồn tại!' });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        res.redirect('/users/login');
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.render('users/register', { error: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
};

// [GET] Trang đăng nhập
exports.getLogin = (req, res) => {
    res.render('users/login', { error: null });
};

// [POST] Xử lý đăng nhập
exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.render('users/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('users/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        res.redirect('/');
    } catch (error) {
        res.render('users/login', { error: 'Có lỗi xảy ra trong quá trình đăng nhập!' });
    }
};

// [GET] Đăng xuất
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/users/login');
    });
};