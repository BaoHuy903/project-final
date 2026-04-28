require('dotenv').config();
const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Kết nối Database
connectDB();

// Cấu hình View Engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Cấu hình Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// Helper: Màu theo trạng thái công việc
app.use((req, res, next) => {
    res.locals.getColorByStatus = (status) => {
        const colors = {
            'Cần làm': '#c0392b',
            'Đang làm': '#f39c12',
            'Hoàn thành': '#27ae60'
        };
        return colors[status] || '#9aa0a6';
    };
    next();
});

// Routes
app.use('/users', userRoutes);
app.use('/', (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/users/login');
    }
    next();
});
app.use('/', taskRoutes);

// Khởi chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});