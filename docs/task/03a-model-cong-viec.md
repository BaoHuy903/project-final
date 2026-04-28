# 3. Cấu trúc dữ liệu công việc (Task Model)

---

## File: models/task.js

```javascript
const mongoose = require('mongoose');// import Mongoose

const taskSchema = new mongoose.Schema({// định nghĩa schema Task
    title: { type: String, required: true },// tiêu đề công việc, bắt buộc
    description: { type: String },// mô tả chi tiết, không bắt buộc
    date: { type: Date, required: true },// ngày bắt đầu, bắt buộc
    endDate: { type: Date },// ngày kết thúc, không bắt buộc (task nhiều ngày)
    time: { type: String, required: true, default: '00:00' },// giờ bắt đầu, mặc định 00:00
    endTime: { type: String },// giờ kết thúc, không bắt buộc
    reminder: { type: Number, default: 0 },// nhắc nhở trước bao nhiêu phút, 0 = không nhắc
    status: {// trạng thái công việc
        type: String,
        enum: ['Cần làm', 'Đang làm', 'Hoàn thành'],// chỉ chấp nhận 3 giá trị này
        default: 'Cần làm'// mặc định "Cần làm"
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },// id người tạo task, tham chiếu đến User
    attachments: [{ type: String }],// mảng đường dẫn file đính kèm (vd: ["/uploads/abc.pdf"])

    // Chia sẻ
    visibility: {// quyền xem task
        type: String,
        enum: ['private', 'public', 'shared'],// private = chỉ mình, public = tất cả, shared = người được chọn
        default: 'private'// mặc định chỉ mình tôi xem
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],// danh sách id user được chia sẻ

    // Bình luận
    comments: [{// mảng bình luận nhúng trong task
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// id người tạo bình luận
        username: String,// tên người tạo bình luận
        text: String,// nội dung bình luận
        createdAt: { type: Date, default: Date.now }// thời gian tạo bình luận
    }]
}, { timestamps: true });// tự động thêm createdAt và updatedAt

module.exports = mongoose.model('Task', taskSchema);// tạo model Task → collection "tasks" trong MongoDB
```
