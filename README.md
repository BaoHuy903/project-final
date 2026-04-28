# 📝 Task Management System (Hệ thống Quản lý Công việc)

## 🗺️ Bản Đồ Mã Nguồn (Hướng dẫn Tìm Code Nhanh)

Để dễ dàng nắm bắt và tìm kiếm code, dự án này được tổ chức theo tiêu chuẩn **MVC (Model - View - Controller)**. Dưới đây là "bản đồ" chỉ đường đến các tính năng chính:

### 1. 🖥️ Giao diện (Frontend & UI)
Tất cả những gì bạn nhìn thấy trên màn hình nằm ở thư mục `views/` và `public/`:
- **Trang chủ / Lịch làm việc**: `views/tasks/index.ejs` (Giao diện chính).
- **Các Popup (Modal) Thêm/Xem chi tiết**: Nằm gọn gàng trong `views/partials/modals/`.
- **Logic vẽ Lịch & Giao diện động**: `public/js/calendar.js` (Chứa các hàm vẽ UI như `renderComments`, `renderAttachments`).
- **Trang Đăng ký / Đăng nhập**: `views/users/login.ejs` và `register.ejs`.

### 2. 🧠 Xử lý Logic (Backend & Controllers)
Nơi xử lý dữ liệu (nhận form, lưu Database) nằm ở thư mục `controllers/`:
- **Xử lý Công việc (Task)**: `controllers/taskController.js` (Chứa logic Thêm, Sửa, Xóa, Gán quyền, Bình luận...).
- **Xử lý Tài khoản (User)**: `controllers/userController.js` (Chứa logic Đăng ký, Đăng nhập, Mã hóa mật khẩu).

### 3. 🛣️ Điều hướng (Routes)
Nơi định nghĩa các đường dẫn (URL) như `/login`, `/new`, `/delete/:id` nằm ở `routes/`:
- **URL liên quan đến Task**: `routes/taskRoutes.js`.
- **URL liên quan đến User**: `routes/userRoutes.js`.

### 4. 🗄️ Cơ sở dữ liệu (Models)
Nơi định nghĩa cấu trúc dữ liệu lưu trong MongoDB:
- **Bảng Công việc**: `models/task.js`.
- **Bảng Người dùng**: `models/user.js`.

### 5. 📚 Tài liệu chi tiết (Docs)
Mọi giải thích sâu hơn về từng dòng code, luồng chạy đều nằm trong thư mục `docs/`. Bạn có thể đọc file `docs/README.md` để xem mục lục tài liệu.

---

## 📌 Giới thiệu Dự án
Hệ thống quản lý công việc được xây dựng nhằm hỗ trợ người dùng quản lý, theo dõi và tối ưu hóa tiến độ công việc cá nhân một cách hiệu quả.

### 🔐 Chức năng 1: Quản lý người dùng (Hồ Thăng Bảo Huy)
* Đăng ký, Đăng nhập, Đăng xuất.
* Mã hóa mật khẩu bằng bcrypt, bảo mật bằng session & middleware.

### 📋 Chức năng 2: Quản lý công việc (Nguyễn Bá Toàn)
* Xây dựng CRUD cho Task.
* Giao diện nhập liệu, Modal chi tiết.

### 🔍 Chức năng 3: Tìm kiếm & Giao diện (Trần Tiến Minh)
* Lọc công việc theo trạng thái, tìm kiếm.
* Giao diện Lịch thông minh (FullCalendar) & Bootstrap.

---

## 🚀 Công nghệ & Cài đặt
* **Tech Stack**: Node.js, Express.js, MongoDB (Mongoose), EJS, Bootstrap 5.
* **Cài đặt**:
  ```bash
  npm install
  npm start
  ```
