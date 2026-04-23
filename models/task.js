const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true }, // Ngày bắt đầu
    endDate: { type: Date }, // MỚI: Ngày kết thúc
    time: { type: String, required: true, default: '00:00' }, 
    endTime: { type: String }, 
    reminder: { type: Number, default: 0 },
    status: { type: String, enum: ['Cần làm', 'Đang làm', 'Hoàn thành'], default: 'Cần làm' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
