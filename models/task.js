const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true }, // Sẽ lưu cả ngày và giờ
    status: { type: String, enum: ['Cần làm', 'Đang làm', 'Hoàn thành'], default: 'Cần làm' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachment: { type: String },
    reminderMinutes: { type: Number, default: 0 } // Thêm dòng này (0 = không thông báo)
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);