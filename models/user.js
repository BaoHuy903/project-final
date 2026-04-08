const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Middleware: Mã hóa mật khẩu trước khi lưu vào database
// Lưu ý: Đã bỏ next() vì chúng ta đang dùng async function
userSchema.pre('save', async function() {
    // Nếu password không bị thay đổi (hoặc không phải mới tạo) thì bỏ qua
    if (!this.isModified('password')) return;
    
    // Băm mật khẩu với độ phức tạp là 10
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);