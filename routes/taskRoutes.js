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

// Bộ lọc: Chỉ cho phép ảnh và file văn bản (doc, pdf, xls...)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh và văn bản!'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn file 10MB
});

router.use(requireAuth);

router.get('/', taskController.getAllTasks);
router.get('/new', taskController.getNewTaskForm);

// 👉 Gắn upload.array vào form Thêm mới
router.post('/new', upload.array('attachments', 5), taskController.createTask); 

router.get('/edit/:id', taskController.getEditTaskForm);

// 👉 Gắn upload.array vào form Sửa
router.post('/edit/:id', upload.array('attachments', 5), taskController.updateTask); 

router.post('/delete/:id', taskController.deleteTask);

router.post('/comment/:id', taskController.addComment);

module.exports = router;