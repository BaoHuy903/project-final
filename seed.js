const mongoose = require('mongoose');
const Task = require('./models/task'); // Đảm bảo đường dẫn đúng
const User = require('./models/user'); // Đảm bảo đường dẫn đúng

// Thay bằng chuỗi kết nối MongoDB của bạn (giống trong app.js)
const dbURI = 'mongodb://127.0.0.1:27017/task_manager'; 

// Dữ liệu mẫu (15 tasks)
const sampleTasks = [
    { title: 'Setup cấu trúc thư mục MVC', description: 'Tạo folders models, views, controllers, routes', status: 'Hoàn thành', daysOffset: -5 },
    { title: 'Thiết kế Database Schema', description: 'Làm model cho User và Task bằng Mongoose', status: 'Hoàn thành', daysOffset: -3 },
    { title: 'Code giao diện Trang chủ', description: 'Dùng Bootstrap 5 làm layout cơ bản', status: 'Hoàn thành', daysOffset: -1 },
    { title: 'Fix lỗi thanh tiến độ', description: 'Sửa lỗi % bị nhảy khi dùng bộ lọc', status: 'Hoàn thành', daysOffset: 0 },
    { title: 'Học cách dùng GitHub', description: 'Push code lên repo chung để làm việc nhóm', status: 'Đang làm', daysOffset: 0 },
    { title: 'Code tính năng Đăng nhập', description: 'Sử dụng bcrypt để mã hóa mật khẩu', status: 'Đang làm', daysOffset: 1 },
    { title: 'Nộp báo cáo tiến độ tuần 1', description: 'Viết báo cáo gửi cho giảng viên', status: 'Đang làm', daysOffset: 1 },
    { title: 'Mua sắm cuối tuần', description: 'Đi siêu thị mua mì tôm và nước ngọt để chạy deadline', status: 'Chưa làm', daysOffset: 2 },
    { title: 'Cài đặt Flash messages', description: 'Thêm thông báo màu xanh/đỏ khi thao tác', status: 'Chưa làm', daysOffset: 2 },
    { title: 'Thảo luận đồ án', description: 'Họp team chia task cho tuần 2', status: 'Chưa làm', daysOffset: 3 },
    { title: 'Gửi email cho khách hàng', description: 'Báo giá project freelance', status: 'Chưa làm', daysOffset: 4 },
    { title: 'Code chức năng Xóa Task', description: 'Thêm nút confirm trước khi xóa', status: 'Chưa làm', daysOffset: 5 },
    { title: 'Dọn dẹp phòng', description: 'Phòng bừa bộn quá rồi', status: 'Chưa làm', daysOffset: 5 },
    { title: 'Làm slide thuyết trình', description: 'Chuẩn bị cho buổi bảo vệ giữa kỳ', status: 'Chưa làm', daysOffset: 7 },
    { title: 'Bảo vệ đồ án', description: 'Ăn mặc chỉnh tề, chuẩn bị tinh thần', status: 'Chưa làm', daysOffset: 14 }
];

const seedDB = async () => {
    try {
        // 1. Kết nối DB
        await mongoose.connect(dbURI);
        console.log('✅ Đã kết nối Database để rải data...');

        // 2. Tìm người dùng đầu tiên trong hệ thống
        const user = await User.findOne();
        if (!user) {
            console.log('❌ KHÔNG TÌM THẤY USER NÀO!');
            console.log('💡 Hãy chạy app (node app.js), lên web đăng ký 1 tài khoản trước, sau đó mới chạy lại file seed này.');
            process.exit(1);
        }

        console.log(`👤 Đang gán dữ liệu cho user: ${user.username} (ID: ${user._id})`);

        // 3. Xóa các task cũ của user này (tùy chọn, để tránh bị trùng lặp nếu chạy file nhiều lần)
        await Task.deleteMany({ user: user._id });
        console.log('🗑️ Đã dọn dẹp các task cũ của user này.');

        // 4. Tạo mảng task mới với ngày tháng thực tế và gán ID user
        const tasksToInsert = sampleTasks.map(task => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + task.daysOffset); // Tính ngày dựa vào số ngày offset
            
            return {
                title: task.title,
                description: task.description,
                status: task.status,
                dueDate: dueDate,
                user: user._id // BẮT BUỘC: Gắn task này cho user tìm được
            };
        });

        // 5. Đẩy vào Database
        await Task.insertMany(tasksToInsert);
        console.log(`🎉 Đã thêm thành công ${tasksToInsert.length} tasks mẫu!`);

    } catch (error) {
        console.error('Lỗi khi seed data:', error);
    } finally {
        // 6. Ngắt kết nối
        mongoose.connection.close();
        console.log('🔌 Đã ngắt kết nối DB.');
    }
};

// Chạy hàm
seedDB();