require('dotenv').config();
const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');

const app = express();

// Kết nối Database
connectDB();

// Cấu hình View Engine là EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Middlewares xử lý dữ liệu form và file tĩnh
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Cấu hình Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // Cookie sống 1 ngày
}));

// Gắn Routes
app.use('/users', userRoutes);

// Route Trang chủ tạm thời để test đăng nhập/đăng xuất
app.get('/', (req, res) => {
    // Nếu chưa có session userId -> chưa đăng nhập -> đuổi về trang login
    if (!req.session.userId) {
        return res.redirect('/users/login');
    }
    
    // Nếu đã đăng nhập thành công
    res.send(`
        <h1>Chào mừng, ${req.session.username}!</h1>
        <p>Bạn đã đăng nhập thành công vào hệ thống quản lý công việc.</p>
        <a href="/users/logout"><button>Đăng Xuất</button></a>
    `);
});

// Khởi chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});