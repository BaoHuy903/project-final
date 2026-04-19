const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true, default: '00:00' }, // Giờ bắt đầu
    endTime: { type: String }, // QUAN TRỌNG: Thêm dòng này để lưu Giờ kết thúc
    reminder: { type: Number, default: 0 },
    status: { type: String, enum: ['Cần làm', 'Đang làm', 'Hoàn thành'], default: 'Cần làm' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);