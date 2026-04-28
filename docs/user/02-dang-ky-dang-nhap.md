# 2. Đăng ký / Đăng nhập / Đăng xuất

---

## File: models/user.js

```javascript
const mongoose = require('mongoose');// import Mongoose để định nghĩa schema
const bcrypt = require('bcryptjs');// import bcrypt — mã hóa mật khẩu thành hash một chiều

const userSchema = new mongoose.Schema({// định nghĩa schema User
    username: { type: String, required: true, unique: true },// tên đăng nhập, bắt buộc, không được trùng
    password: { type: String, required: true }// mật khẩu, bắt buộc (lưu dưới dạng hash)
});

userSchema.pre('save', async function() {// hook chạy TRƯỚC khi lưu vào DB (dùng function() để truy cập this)
    if (!this.isModified('password')) return;// nếu password không thay đổi → bỏ qua, không hash lại
    this.password = await bcrypt.hash(this.password, 10);// hash mật khẩu với salt = 10 vòng lặp
});

module.exports = mongoose.model('User', userSchema);// tạo model User → collection "users" trong MongoDB
```

---

## File: controllers/userController.js

```javascript
const User = require('../models/user');// import model User để truy vấn database
const bcrypt = require('bcryptjs');// import bcrypt để so sánh password khi đăng nhập

// [GET] Render trang đăng ký
exports.getRegister = (req, res) => {// xử lý GET /users/register
    res.render('users/register', { error: null });// hiển thị form đăng ký, chưa có lỗi nên error = null
};

// [POST] Xử lý đăng ký
exports.postRegister = async (req, res) => {// xử lý POST /users/register (khi submit form)
    try {
        const { username, password } = req.body;// lấy username và password từ form gửi lên

        const existingUser = await User.findOne({ username });// tìm xem username đã tồn tại chưa
        if (existingUser) {// nếu đã có
            return res.render('users/register', { error: 'Tên đăng nhập đã tồn tại!' });// báo lỗi
        }

        const newUser = new User({ username, password });// tạo user mới (password còn là text thường)
        await newUser.save();// lưu vào DB (hook pre('save') sẽ tự hash password)

        res.redirect('/users/login');// đăng ký xong → chuyển sang trang đăng nhập
    } catch (error) {
        console.error("====== LỖI ĐĂNG KÝ ======", error);// log lỗi ra terminal
        res.render('users/register', { error: 'Có lỗi xảy ra, vui lòng thử lại!' });// báo lỗi chung
    }
};

// [GET] Render trang đăng nhập
exports.getLogin = (req, res) => {// xử lý GET /users/login
    res.render('users/login', { error: null });// hiển thị form đăng nhập
};

// [POST] Xử lý đăng nhập
exports.postLogin = async (req, res) => {// xử lý POST /users/login
    try {
        const { username, password } = req.body;// lấy thông tin từ form

        const user = await User.findOne({ username });// tìm user theo username
        if (!user) {// không tìm thấy
            return res.render('users/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });// báo lỗi chung (bảo mật)
        }

        const isMatch = await bcrypt.compare(password, user.password);// so sánh password nhập với hash trong DB
        if (!isMatch) {// không khớp
            return res.render('users/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });// báo lỗi
        }

        req.session.userId = user._id;// lưu userId vào session → đánh dấu đã đăng nhập
        req.session.username = user.username;// lưu username vào session để hiển thị lời chào

        res.redirect('/');// đăng nhập thành công → chuyển về trang chủ
    } catch (error) {
        res.render('users/login', { error: 'Có lỗi xảy ra trong quá trình đăng nhập!' });
    }
};

// [GET] Xử lý đăng xuất
exports.logout = (req, res) => {// xử lý GET /users/logout
    req.session.destroy((err) => {// xóa toàn bộ session trên server
        if (err) console.log(err);// log lỗi nếu có
        res.redirect('/users/login');// chuyển về trang đăng nhập
    });
};
```

---

## File: middlewares/authMiddleware.js

```javascript
const requireAuth = (req, res, next) => {// middleware kiểm tra đăng nhập
    if (!req.session.userId) {// nếu chưa đăng nhập
        return res.redirect('/users/login');// redirect về login
    }
    next();// đã đăng nhập → cho đi tiếp đến controller
};

module.exports = { requireAuth };// export để các file route import sử dụng
```

---

## File: routes/userRoutes.js

```javascript
const express = require('express');// import Express
const router = express.Router();// tạo router — nhóm các route lại với nhau
const userController = require('../controllers/userController');// import controller chứa hàm xử lý

router.get('/register', userController.getRegister);// GET /users/register → hiện form đăng ký
router.post('/register', userController.postRegister);// POST /users/register → xử lý đăng ký

router.get('/login', userController.getLogin);// GET /users/login → hiện form đăng nhập
router.post('/login', userController.postLogin);// POST /users/login → xử lý đăng nhập

router.get('/logout', userController.logout);// GET /users/logout → xử lý đăng xuất

module.exports = router;// export router để app.js gắn vào đường dẫn /users
```
