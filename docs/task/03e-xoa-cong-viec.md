# 3e. Xóa công việc (Delete)

---

## File: controllers/taskController.js

```javascript
exports.deleteTask = async (req, res) => {// xử lý POST /delete/:id
    await Task.findOneAndDelete({// tìm và xóa 1 document
        _id: req.params.id,// điều kiện 1: đúng id bài viết (lấy từ URL /delete/:id)
        user: req.session.userId// điều kiện 2: đúng chủ bài viết (bảo mật: không xóa được task người khác)
    });
    res.redirect('/');// quay về trang chủ
};
```

---

## File: routes/taskRoutes.js

```javascript
router.post('/delete/:id', taskController.deleteTask);// POST /delete/:id → xóa công việc
```
