const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    endDate: { type: Date },
    time: { type: String, required: true, default: '00:00' },
    endTime: { type: String },
    reminder: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Cần làm', 'Đang làm', 'Hoàn thành'],
        default: 'Cần làm'
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: [{ type: String }],

    // Chia sẻ
    visibility: {
        type: String,
        enum: ['private', 'public', 'shared'],
        default: 'private'
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Bình luận
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);