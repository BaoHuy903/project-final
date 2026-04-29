const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Cấu hình Multer lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ Uoload các file hình ảnh và tài liệu! cơ bản thôi nhé!!!!!!!!!!!!!!!!!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Tất cả routes yêu cầu đăng nhập
router.use(requireAuth);

router.get('/', taskController.getAllTasks);
router.get('/new', taskController.getNewTaskForm);
router.post('/new', upload.array('attachments', 5), taskController.createTask);
router.get('/edit/:id', taskController.getEditTaskForm);
router.post('/edit/:id', upload.array('attachments', 5), taskController.updateTask);
router.post('/delete/:id', taskController.deleteTask);
router.post('/comment/:id', taskController.addComment);

module.exports = router;