const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Đăng ký
router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);

// Đăng nhập
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

// Đăng xuất
router.get('/logout', userController.logout);

module.exports = router;