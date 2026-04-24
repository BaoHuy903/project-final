const Task = require('../models/task');
const User = require('../models/user'); // Cần import bảng User

// [GET] Trang chủ - Load cả task được chia sẻ
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { user: req.session.userId }, // Task của mình
                { visibility: 'public' },     // Task công khai của người khác
                { sharedWith: req.session.userId } // Task được người khác chia sẻ đích danh
            ]
        })
        .populate('user', 'username') // Lấy username của người tạo
        .sort({ createdAt: -1 });

        res.render('tasks/index', { 
            tasks, 
            username: req.session.username,
            currentUserId: req.session.userId // Truyền id để phân quyền UI
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
};

// [GET] Form thêm mới
exports.getNewTaskForm = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.session.userId } }); // Lấy danh sách user khác mình
        res.render('tasks/new', { username: req.session.username, users });
    } catch (error) {
        res.redirect('/');
    }
};

// [POST] Xử lý thêm công việc
exports.createTask = async (req, res) => {
    try {
        const { title, description, date, endDate, time, endTime, reminder, status, visibility, sharedWith } = req.body;
        
        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => '/uploads/' + file.filename);
        }

        const newTask = new Task({
            title, description, date, endDate: endDate || date,
            time: time || '00:00', endTime,
            reminder: parseInt(reminder) || 0, status,
            user: req.session.userId, attachments,
            visibility: visibility || 'private',
            sharedWith: sharedWith ? (Array.isArray(sharedWith) ? sharedWith : [sharedWith]) : []
        });
        
        await newTask.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi thêm công việc');
    }
};

// [GET] Form sửa
exports.getEditTaskForm = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.session.userId) {
            return res.redirect('/'); // Chỉ chủ sở hữu mới được sửa
        }
        const users = await User.find({ _id: { $ne: req.session.userId } });
        res.render('tasks/edit', { task, username: req.session.username, users });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

// [POST] Xử lý sửa
exports.updateTask = async (req, res) => {
    try {
        const { title, description, date, endDate, time, endTime, reminder, status, visibility, sharedWith } = req.body;
        
        const currentTask = await Task.findById(req.params.id);
        let updatedAttachments = currentTask.attachments || [];

        if (req.files && req.files.length > 0) {
            updatedAttachments = req.files.map(file => '/uploads/' + file.filename);
        }

        await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.session.userId }, 
            { 
                title, description, date, endDate: endDate || date, 
                time, endTime, reminder: parseInt(reminder) || 0, status,
                attachments: updatedAttachments,
                visibility: visibility || 'private',
                sharedWith: sharedWith ? (Array.isArray(sharedWith) ? sharedWith : [sharedWith]) : []
            }
        );
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

// [POST] Xóa
exports.deleteTask = async (req, res) => {
    try {
        await Task.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
};

// 👉 [POST] Xử lý thêm Comment
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') return res.redirect('/');

        await Task.findByIdAndUpdate(req.params.id, {
            $push: {
                comments: {
                    userId: req.session.userId,
                    username: req.session.username,
                    text: text.trim()
                }
            }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};