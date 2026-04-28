# 3c. Thêm công việc (Create)

---

## File: controllers/taskController.js

```javascript
exports.getNewTaskForm = async (req, res) => {// xử lý GET /new — hiện form thêm task
    const users = await User.find({ _id: { $ne: req.session.userId } });// lấy danh sách user khác (cho chia sẻ)
    res.render('tasks/new', { users });// render form thêm task
};

exports.createTask = async (req, res) => {// xử lý POST /new — tạo task mới
    const { title, description, date, endDate, time, endTime, reminder, status, visibility, sharedWith } = req.body;// lấy tất cả dữ liệu từ form

    let attachments = [];// mảng đường dẫn file đính kèm
    if (req.files && req.files.length > 0) {// nếu có file upload (do Multer xử lý)
        attachments = req.files.map(file => '/uploads/' + file.filename);// tạo đường dẫn cho mỗi file
    }

    const newTask = new Task({// tạo task mới
        title, description, date,
        endDate: endDate || date,// nếu không nhập endDate thì lấy bằng date
        time: time || '00:00', endTime,
        reminder: parseInt(reminder) || 0,// chuyển sang số nguyên, mặc định 0
        status, 
        user: req.session.userId,// gán người tạo là user đang login
        attachments,// gán file đính kèm
        visibility: visibility || 'private',// mặc định là private
        sharedWith: sharedWith ? (Array.isArray(sharedWith) ? sharedWith : [sharedWith]) : []// xử lý: 1 người → bọc mảng, nhiều người → giữ nguyên, không chọn → mảng rỗng
    });

    await newTask.save();// lưu vào MongoDB
    res.redirect('/');// quay về trang chủ
};
```

---

## File: routes/taskRoutes.js

```javascript
router.get('/new', taskController.getNewTaskForm);// GET /new → hiện form thêm công việc
router.post('/new', upload.array('attachments', 5), taskController.createTask);// POST /new → tạo task, upload tối đa 5 file
```
