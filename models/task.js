const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true, default: '00:00' }, // Thêm Giờ
    reminder: { type: Number, default: 0 }, // Thêm Nhắc nhở (phút)
    status: { type: String, enum: ['Cần làm', 'Đang làm', 'Hoàn thành'], default: 'Cần làm' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
<<<<<<< HEAD

    // 👉 sửa ở đây
    attachments: [{ type: String }]

=======
    attachment: { type: String }
>>>>>>> aab0317908514fce79c0693786641f368409ec1c
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);