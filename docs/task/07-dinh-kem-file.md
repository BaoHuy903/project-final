# 7. Đính kèm file

---

## File: routes/taskRoutes.js

```javascript
const multer = require('multer');// import Multer — thư viện xử lý upload file (parse multipart/form-data)
const path = require('path');// import module path — xử lý đường dẫn file

const storage = multer.diskStorage({// cấu hình lưu file vào ổ đĩa
    destination: function (req, file, cb) {// nơi lưu file
        cb(null, 'public/uploads/');// tất cả file upload lưu vào thư mục public/uploads/
    },
    filename: function (req, file, cb) {// cách đặt tên file
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);// timestamp + số random + đuôi file gốc → tránh trùng tên
        cb(null, uniqueName);// vd: 1714300000-123456789.pdf
    }
});

const fileFilter = (req, file, cb) => {// bộ lọc loại file
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx/;// regex danh sách đuôi file cho phép
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());// kiểm tra đuôi file

    if (extname) return cb(null, true);// đuôi hợp lệ → cho phép upload
    else cb(new Error('Chỉ cho phép upload file ảnh và văn bản!'));// không hợp lệ → báo lỗi
};

const upload = multer({// tạo instance Multer
    storage: storage,// nơi lưu + cách đặt tên
    fileFilter: fileFilter,// bộ lọc loại file
    limits: { fileSize: 10 * 1024 * 1024 }// giới hạn 10MB/file
});

router.post('/new', upload.array('attachments', 5), taskController.createTask);// upload tối đa 5 file từ input name="attachments", xong gọi createTask
```

---

## File: controllers/taskController.js

```javascript
    let attachments = [];// mảng đường dẫn file
    if (req.files && req.files.length > 0) {// nếu có file upload (Multer đã xử lý)
        attachments = req.files.map(file => '/uploads/' + file.filename);// tạo đường dẫn: /uploads/1714300000-123456789.pdf
    }

    // Khi sửa task:
    let updatedAttachments = currentTask.attachments || [];// giữ file cũ
    if (req.files && req.files.length > 0) {// nếu upload file mới
        updatedAttachments = req.files.map(file => '/uploads/' + file.filename);// ghi đè file cũ bằng file mới
    }
```

---

## File: public/js/calendar.js – Hiển thị file đính kèm

```javascript
    const files = props.attachments.split(',').filter(f => f.trim() !== '');// tách chuỗi "/uploads/a.pdf,/uploads/b.jpg" thành mảng, bỏ phần tử rỗng

    const ext = fileName.split('.').pop().toLowerCase();// lấy đuôi file (vd: "pdf", "jpg")
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);// kiểm tra có phải ảnh không

    if (isImage) {// nếu là ảnh
        attachmentsHtml += `<img src="${file}" style="width: 50px; height: 50px; object-fit: cover;">`;// hiện thumbnail 50x50, object-fit: cover crop vừa khung
    } else {// nếu không phải ảnh
        let icon = '📄';// icon mặc định
        if (ext === 'pdf') icon = '📕';// PDF → icon đỏ
        if (['doc', 'docx'].includes(ext)) icon = '📘';// Word → icon xanh
        if (['xls', 'xlsx'].includes(ext)) icon = '📗';// Excel → icon xanh lá
    }
```
