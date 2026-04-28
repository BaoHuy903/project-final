# 3d. Sửa công việc (Update)

---

## File: controllers/taskController.js

### getEditTaskForm – Hiện form sửa

```javascript
exports.getEditTaskForm = async (req, res) => {// xử lý GET /edit/:id
    const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });// tìm task của mình theo id
    if (!task) return res.redirect('/');// không tìm thấy (hoặc không phải chủ) → về trang chủ
    const users = await User.find({ _id: { $ne: req.session.userId } });// lấy danh sách user khác (cho chia sẻ)
    res.render('tasks/edit', { task, users });// render form sửa, truyền dữ liệu task hiện tại
};
```

### updateTask – Lưu chỉnh sửa

```javascript
exports.updateTask = async (req, res) => {// xử lý POST /edit/:id
    const { title, description, date, endDate, time, endTime, reminder, status, visibility, sharedWith } = req.body;// lấy dữ liệu từ form

    const currentTask = await Task.findById(req.params.id);// tìm task hiện tại
    let updatedAttachments = currentTask.attachments || [];// giữ file cũ

    if (req.files && req.files.length > 0) {// nếu upload file mới
        updatedAttachments = req.files.map(file => '/uploads/' + file.filename);// ghi đè file cũ bằng file mới
    }

    await Task.findOneAndUpdate(// cập nhật task trong MongoDB
        { _id: req.params.id, user: req.session.userId },// điều kiện: đúng id VÀ đúng chủ (bảo mật)
        {
            title, description, date,
            endDate: endDate || date,// nếu không nhập endDate thì lấy bằng date
            time, endTime,
            reminder: parseInt(reminder) || 0, status,// ép kiểu số nguyên cho reminder
            attachments: updatedAttachments,// danh sách file đính kèm (cũ hoặc mới)
            visibility: visibility || 'private',// mặc định là private
            sharedWith: sharedWith ? (Array.isArray(sharedWith) ? sharedWith : [sharedWith]) : []// xử lý mảng chia sẻ
        }
    );
    res.redirect('/');// quay về trang chủ
};
```

---

## File: routes/taskRoutes.js

```javascript
router.get('/edit/:id', taskController.getEditTaskForm);// GET /edit/:id → hiện form sửa công việc
router.post('/edit/:id', upload.array('attachments', 5), taskController.updateTask);// POST /edit/:id → lưu chỉnh sửa, upload tối đa 5 file
```
