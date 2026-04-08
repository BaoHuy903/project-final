const User = require('../models/user');
const bcrypt = require('bcryptjs');

// [GET] Render trang đăng ký
exports.getRegister = (req, res) => {
    res.render('users/register', { error: null });
};

// [POST] Xử lý đăng ký
exports.postRegister = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Kiểm tra xem user đã tồn tại chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('users/register', { error: 'Tên đăng nhập đã tồn tại!' });
        }

        // Tạo user mới
        const newUser = new User({ username, password });
        await newUser.save();
        
        res.redirect('/users/login');
    } catch (error) {
        // Dòng này sẽ giúp in ra nguyên nhân gốc rễ gây lỗi đăng ký
        console.error("====== LỖI ĐĂNG KÝ ======", error); 
        
        res.render('users/register', { error: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
};

// [GET] Render trang đăng nhập
exports.getLogin = (req, res) => {
    res.render('users/login', { error: null });
};

// [POST] Xử lý đăng nhập
exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Tìm user
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('users/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('users/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
        }

        // Lưu thông tin vào session
        req.session.userId = user._id;
        req.session.username = user.username;
        
        // Chuyển hướng về trang chủ
        res.redirect('/');
    } catch (error) {
        res.render('users/login', { error: 'Có lỗi xảy ra trong quá trình đăng nhập!' });
    }
};

// [GET] Xử lý đăng xuất
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/users/login');
    });
};