# 1. Khởi chạy ứng dụng

---

## File: app.js

```javascript
require('dotenv').config();// load file .env để đọc biến môi trường (MONGODB_URI, SESSION_SECRET...)

const express = require('express');// import Express — framework tạo web server
const session = require('express-session');// import express-session — quản lý phiên đăng nhập
const connectDB = require('./config/db');// import hàm kết nối MongoDB từ file config/db.js
const flash = require('connect-flash');// import connect-flash — hiển thị thông báo 1 lần (flash message)

const userRoutes = require('./routes/userRoutes');// import route xử lý đăng ký/đăng nhập/đăng xuất
const taskRoutes = require('./routes/taskRoutes');// import route xử lý CRUD công việc

const app = express();// tạo instance Express — ứng dụng web chính

connectDB();// gọi hàm kết nối MongoDB, nếu thất bại thì app thoát

app.set('view engine', 'ejs');// dùng EJS làm template engine (nhúng JS vào HTML bằng <%= %> và <% %>)
app.set('views', './views');// chỉ định thư mục chứa file giao diện là ./views

app.use(express.urlencoded({ extended: true }));// middleware đọc dữ liệu form HTML khi submit
app.use(express.json());// middleware đọc dữ liệu JSON từ body request
app.use(express.static('public'));// phục vụ file tĩnh từ thư mục public (css, js, uploads...)

app.use(session({// cấu hình session
    secret: process.env.SESSION_SECRET,// khóa bí mật dùng mã hóa session ID, lấy từ file .env
    resave: false,// không lưu lại session nếu không có thay đổi
    saveUninitialized: false,// không tạo session cho request chưa đăng nhập
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }// cookie sống 24 giờ, cho phép HTTP (không bắt buộc HTTPS)
}));

app.use(flash());// kích hoạt flash message

app.use((req, res, next) => {// middleware truyền biến vào tất cả file EJS
    res.locals.success_msg = req.flash('success_msg');// lấy thông báo thành công (nếu có)
    res.locals.error_msg = req.flash('error_msg');// lấy thông báo lỗi (nếu có)
    res.locals.username = req.session?.username || null;// truyền tên user đang login vào view
    res.locals.getColorByStatus = (status) => {// hàm helper trả về mã màu theo trạng thái task
        const colors = {
            'Cần làm': '#c0392b',// đỏ
            'Đang làm': '#f39c12',// vàng cam
            'Hoàn thành': '#27ae60'// xanh lá
        };
        return colors[status] || '#9aa0a6';// trạng thái khác → xám
    };
    next();// chuyển sang middleware tiếp theo
});

app.use('/users', userRoutes);// gắn userRoutes vào /users → /register thành /users/register

app.use('/', (req, res, next) => {// middleware kiểm tra đăng nhập cho tất cả route /
    if (!req.session.userId) {// nếu chưa đăng nhập
        return res.redirect('/users/login');// đuổi về trang login
    }
    next();// đã đăng nhập → cho đi tiếp
});

app.use('/', taskRoutes);// gắn taskRoutes vào / → GET / là trang chủ hiển thị lịch

const PORT = process.env.PORT || 3000;// lấy port từ biến môi trường, mặc định 3000
app.listen(PORT, () => {// khởi chạy server
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
```

---

## File: config/db.js

```javascript
const mongoose = require('mongoose');// import Mongoose — thư viện ODM tương tác với MongoDB

const connectDB = async () => {// hàm async vì kết nối DB mất thời gian
    try {
        await mongoose.connect(process.env.MONGODB_URI);// kết nối MongoDB bằng URI từ file .env
        console.log('Kết nối MongoDB thành công!');// log khi kết nối thành công
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error.message);// log lỗi nếu kết nối thất bại
        process.exit(1);// thoát app với mã lỗi 1
    }
};

module.exports = connectDB;// export hàm để app.js import sử dụng
```
