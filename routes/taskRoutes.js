const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Áp dụng middleware kiểm tra đăng nhập cho TOÀN BỘ route bên dưới
router.use(requireAuth);

router.get('/', taskController.getAllTasks); // Trang chủ
router.get('/new', taskController.getNewTaskForm); // Trang thêm mới
router.post('/new', upload.single('attachment'), taskController.createTask); // Xử lý form thêm mới
router.get('/edit/:id', taskController.getEditTaskForm); // Trang sửa
router.post('/edit/:id', taskController.updateTask); // Xử lý form sửa
router.post('/delete/:id', taskController.deleteTask); // Xử lý xóa

module.exports = router;