const Task = require('../models/task');

// [GET] Lấy danh sách công việc (Trang chủ)
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.session.userId }).sort({ createdAt: -1 });
        res.render('tasks/index', { 
            tasks, 
            username: req.session.username 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
};

// [GET] Form thêm công việc mới
exports.getNewTaskForm = (req, res) => {
    res.render('tasks/new', { username: req.session.username });
};

// [POST] Xử lý thêm công việc
exports.createTask = async (req, res) => {
    try {
        // THÊM endTime vào đây
        const { title, description, date, time, endTime, reminder, status } = req.body;
        const newTask = new Task({
            title,
            description,
            date,
            time: time || '00:00',
            endTime, // Gắn vào object lưu database
            reminder: parseInt(reminder) || 0,
            status,
            user: req.session.userId,
            attachment: req.file ? '/uploads/' + req.file.filename : null
        });
        await newTask.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi thêm công việc');
    }
};

// [GET] Form sửa công việc
exports.getEditTaskForm = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.session.userId) {
            return res.redirect('/'); 
        }
        res.render('tasks/edit', { task, username: req.session.username });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

// [POST] Xử lý cập nhật công việc
exports.updateTask = async (req, res) => {
    try {
        // THÊM endTime vào đây
        const { title, description, date, time, endTime, reminder, status } = req.body;
        await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.session.userId }, 
            { title, description, date, time, endTime, reminder: parseInt(reminder) || 0, status } // Cập nhật endTime
        );
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

// [POST] Xử lý xóa công việc
exports.deleteTask = async (req, res) => {
    try {
        await Task.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};