# 3b. Xem công việc (Read)

---

## File: controllers/taskController.js

```javascript
const Task = require('../models/task');// import model Task
const User = require('../models/user');// import model User

exports.getAllTasks = async (req, res) => {// xử lý GET / — trang chủ hiển thị lịch
    const tasks = await Task.find({// truy vấn MongoDB
        $or: [// toán tử $or: thỏa BẤT KỲ 1 trong 3 điều kiện
            { user: req.session.userId },// task do mình tạo
            { visibility: 'public' },// task công khai
            { sharedWith: req.session.userId }// task được chia sẻ cho mình
        ]
    })
    .populate('user', 'username')// thay ObjectId bằng object chứa username (vd: { _id: "...", username: "admin" })
    .sort({ createdAt: -1 });// sắp xếp mới nhất lên trên (-1 = giảm dần)

    const users = await User.find({ _id: { $ne: req.session.userId } });// lấy tất cả user trừ mình (để hiện danh sách chia sẻ)

    res.render('tasks/index', {// render trang chủ với dữ liệu
        tasks,// danh sách task
        username: req.session.username,// tên user đang login
        currentUserId: req.session.userId,// id user đang login (để phân quyền trên giao diện)
        users// danh sách user khác (cho chức năng chia sẻ)
    });
};
```

---

## File: routes/taskRoutes.js

```javascript
router.get('/', taskController.getAllTasks);// GET / → trang chủ, hiển thị tất cả task trên lịch
```
