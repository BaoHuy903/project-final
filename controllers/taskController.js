const Task = require('../models/task');

// [GET] Lấy danh sách công việc + Tìm kiếm & Lọc
exports.getAllTasks = async (req, res) => {
    try {
        // 1. TÍNH TOÁN TIẾN ĐỘ TỔNG THỂ (Không bị ảnh hưởng bởi bộ lọc)
        const totalTasksCount = await Task.countDocuments({ user: req.session.userId });
        const completedTasksCount = await Task.countDocuments({ user: req.session.userId, status: 'Hoàn thành' });

        // 2. XỬ LÝ TÌM KIẾM & LỌC CHO DANH SÁCH BÊN DƯỚI
        let query = { user: req.session.userId };

        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.status && req.query.status !== 'Tất cả') {
            query.status = req.query.status;
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 });
        
        res.render('tasks/index', { 
            tasks, 
            search: req.query.search || '',
            currentStatus: req.query.status || 'Tất cả',
            // Truyền số liệu tổng thể ra giao diện
            totalTasksCount, 
            completedTasksCount
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Lỗi máy chủ khi lấy dữ liệu.');
        res.redirect('/');
    }
};

exports.getNewTaskForm = (req, res) => {
    res.render('tasks/new');
};

exports.createTask = async (req, res) => {
    try {
        const { title, description, status, dueDate } = req.body;
        const newTask = new Task({ title, description, status, dueDate, user: req.session.userId });
        await newTask.save();
        
        req.flash('success_msg', 'Đã thêm công việc mới thành công!');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Lỗi khi thêm công việc mới.');
        res.redirect('/');
    }
};

exports.getEditTaskForm = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.session.userId) return res.redirect('/'); 
        res.render('tasks/edit', { task });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { title, description, status, dueDate } = req.body;
        await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.session.userId }, 
            { title, description, status, dueDate }
        );
        
        req.flash('success_msg', 'Đã cập nhật công việc thành công!');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Lỗi khi cập nhật công việc.');
        res.redirect('/');
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await Task.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
        
        req.flash('success_msg', 'Đã xóa công việc thành công!');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Lỗi khi xóa công việc.');
        res.redirect('/');
    }
};