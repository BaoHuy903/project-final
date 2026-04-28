# 9. Bài đăng (Post)

---

## File: models/post.js

```javascript
const mongoose = require('mongoose');// import Mongoose

const postSchema = new mongoose.Schema({// định nghĩa schema Post
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },// id người đăng, tham chiếu đến User
    content: { type: String, required: true },// nội dung bài đăng, bắt buộc
    image: { type: String },// đường dẫn ảnh đính kèm (vd: "/uploads/abc.jpg"), không bắt buộc
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],// mảng id user đã thích bài viết
    comments: [{// mảng bình luận nhúng trong bài đăng
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// id người bình luận
        username: String,// tên người bình luận
        text: String,// nội dung bình luận
        createdAt: { type: Date, default: Date.now }// thời gian tạo bình luận
    }]
}, { timestamps: true });// tự động thêm createdAt và updatedAt

module.exports = mongoose.model('Post', postSchema);// tạo model Post → collection "posts" trong MongoDB
```

---

## File: controllers/postController.js

```javascript
const Post = require('../models/post');// import model Post

// Xem tất cả bài đăng
exports.getAllPosts = async (req, res) => {// xử lý GET /posts
    const posts = await Post.find()// lấy tất cả bài đăng
        .populate('author', 'username')// thay ObjectId author bằng object chứa username
        .sort({ createdAt: -1 });// mới nhất lên trên (-1 = giảm dần)

    res.render('posts/index', {// render trang feed
        posts,// danh sách bài đăng
        username: req.session.username,// tên user đang login
        currentUserId: req.session.userId// id user đang login (để phân quyền)
    });
};

// Tạo bài đăng mới
exports.createPost = async (req, res) => {// xử lý POST /posts/new
    const { content } = req.body;// lấy nội dung từ form
    if (!content || content.trim() === '') return res.redirect('/posts');// nội dung rỗng → bỏ qua

    let image = null;// mặc định không có ảnh
    if (req.file) {// nếu có upload ảnh (Multer xử lý)
        image = '/uploads/' + req.file.filename;// tạo đường dẫn ảnh
    }

    const newPost = new Post({// tạo bài đăng mới
        author: req.session.userId,// người đăng = user đang login
        content: content.trim(),// nội dung, trim() xóa khoảng trắng thừa
        image// ảnh đính kèm (null nếu không có)
    });

    await newPost.save();// lưu vào MongoDB
    res.redirect('/posts');// quay về trang feed
};

// Xóa bài đăng
exports.deletePost = async (req, res) => {// xử lý POST /posts/delete/:id
    await Post.findOneAndDelete({// tìm và xóa
        _id: req.params.id,// đúng id bài đăng
        author: req.session.userId// VÀ đúng chủ bài viết (bảo mật: không xóa được bài người khác)
    });
    res.redirect('/posts');// quay về trang feed
};

// Thích / bỏ thích
exports.toggleLike = async (req, res) => {// xử lý POST /posts/like/:id
    const post = await Post.findById(req.params.id);// tìm bài đăng theo id
    if (!post) return res.redirect('/posts');// không tìm thấy → quay lại

    const userId = req.session.userId;// id user đang login
    const index = post.likes.indexOf(userId);// tìm xem user đã like chưa

    if (index === -1) {// chưa like
        post.likes.push(userId);// thêm vào mảng likes
    } else {// đã like rồi
        post.likes.splice(index, 1);// xóa khỏi mảng likes (bỏ thích)
    }

    await post.save();// lưu lại
    res.redirect('/posts');// quay về trang feed
};

// Thêm bình luận
exports.addComment = async (req, res) => {// xử lý POST /posts/comment/:id
    const { text } = req.body;// lấy nội dung bình luận từ form
    if (!text || text.trim() === '') return res.redirect('/posts');// rỗng → bỏ qua

    await Post.findByIdAndUpdate(req.params.id, {// tìm bài đăng theo id
        $push: {// thêm vào mảng comments
            comments: {
                userId: req.session.userId,// id người bình luận
                username: req.session.username,// tên người bình luận
                text: text.trim()// nội dung, xóa khoảng trắng thừa
            }
        }
    });

    res.redirect('/posts');// quay về trang feed
};
```

---

## File: routes/postRoutes.js

```javascript
const express = require('express');// import Express
const router = express.Router();// tạo router
const multer = require('multer');// import Multer — xử lý upload ảnh
const path = require('path');// import path — xử lý đường dẫn file
const postController = require('../controllers/postController');// import controller
const { requireAuth } = require('../middlewares/authMiddleware');// import middleware kiểm tra đăng nhập

// Cấu hình Multer (dùng chung cách đặt tên với taskRoutes)
const storage = multer.diskStorage({// lưu file vào ổ đĩa
    destination: (req, file, cb) => cb(null, 'public/uploads/'),// thư mục lưu
    filename: (req, file, cb) => {// cách đặt tên: timestamp + random + đuôi file
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({// tạo instance Multer
    storage,
    fileFilter: (req, file, cb) => {// chỉ cho phép upload ảnh
        const allowed = /jpeg|jpg|png|gif|webp/;
        allowed.test(path.extname(file.originalname).toLowerCase())
            ? cb(null, true)
            : cb(new Error('Chỉ cho phép upload ảnh!'));
    },
    limits: { fileSize: 5 * 1024 * 1024 }// giới hạn 5MB
});

router.use(requireAuth);// tất cả route yêu cầu đăng nhập

router.get('/', postController.getAllPosts);// GET /posts → trang feed
router.post('/new', upload.single('image'), postController.createPost);// POST /posts/new → tạo bài đăng (upload 1 ảnh)
router.post('/delete/:id', postController.deletePost);// POST /posts/delete/:id → xóa bài đăng
router.post('/like/:id', postController.toggleLike);// POST /posts/like/:id → thích/bỏ thích
router.post('/comment/:id', postController.addComment);// POST /posts/comment/:id → bình luận

module.exports = router;// export router để app.js gắn vào /posts
```

---

## File: app.js (phần thêm mới)

```javascript
const postRoutes = require('./routes/postRoutes');// import route bài đăng

app.use('/posts', postRoutes);// gắn postRoutes vào /posts → GET / thành GET /posts
```

---

## File: views/partials/header.ejs (phần thêm mới)

```html
<a href="/posts" class="btn btn-outline-primary btn-sm rounded-pill px-3"><!-- nút Bài đăng trên navbar -->
    <i class="bi bi-pencil-square"></i> Bài đăng
</a>
```

---

## File: views/posts/index.ejs

```html
<%- include('../partials/header') %><!-- include header (navbar) -->

<div class="container py-4" style="max-width: 680px;"><!-- container chính, giới hạn chiều rộng giống Facebook -->

    <!-- ===== FORM TẠO BÀI ĐĂNG ===== -->
    <div class="card mb-4 shadow-sm" style="border-radius: 16px; border: none;"><!-- card tạo bài -->
        <div class="card-body p-3">
            <form action="/posts/new" method="POST" enctype="multipart/form-data"><!-- form gửi POST, hỗ trợ upload file -->
                <div class="d-flex align-items-start gap-3">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                         style="width: 40px; height: 40px; font-weight: 600;"><!-- avatar tròn hiển thị chữ cái đầu -->
                        <%= username.charAt(0).toUpperCase() %>
                    </div>
                    <textarea name="content" class="form-control" rows="2"
                              placeholder="Bạn đang nghĩ gì?" required
                              style="border: none; resize: none; font-size: 15px;"></textarea><!-- ô nhập nội dung -->
                </div>
                <hr class="my-2">
                <div class="d-flex justify-content-between align-items-center">
                    <label class="btn btn-light btn-sm rounded-pill" style="cursor: pointer;"><!-- nút chọn ảnh -->
                        <i class="bi bi-image text-success"></i> Ảnh
                        <input type="file" name="image" accept="image/*" hidden><!-- input file ẩn, chỉ nhận ảnh -->
                    </label>
                    <button type="submit" class="btn btn-primary btn-sm rounded-pill px-4">Đăng</button><!-- nút đăng bài -->
                </div>
            </form>
        </div>
    </div>

    <!-- ===== DANH SÁCH BÀI ĐĂNG ===== -->
    <% posts.forEach(post => { %><!-- duyệt từng bài đăng -->
        <div class="card mb-3 shadow-sm" style="border-radius: 16px; border: none;"><!-- card bài đăng -->
            <div class="card-body p-3">

                <!-- Header: avatar + tên + thời gian -->
                <div class="d-flex align-items-center mb-3">
                    <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                         style="width: 40px; height: 40px; font-weight: 600;"><!-- avatar tác giả -->
                        <%= post.author.username.charAt(0).toUpperCase() %>
                    </div>
                    <div class="ms-2">
                        <strong style="font-size: 14px;"><%= post.author.username %></strong><!-- tên tác giả -->
                        <div style="font-size: 12px; color: #65676b;"><!-- thời gian đăng -->
                            <%= new Date(post.createdAt).toLocaleString('vi-VN') %>
                        </div>
                    </div>
                    <% if (post.author._id.toString() === currentUserId) { %><!-- nếu là chủ bài viết -->
                        <form action="/posts/delete/<%= post._id %>" method="POST" class="ms-auto"><!-- form xóa -->
                            <button type="submit" class="btn btn-sm text-danger" onclick="return confirm('Xóa bài đăng này?')"><!-- nút xóa -->
                                <i class="bi bi-trash"></i>
                            </button>
                        </form>
                    <% } %>
                </div>

                <!-- Nội dung bài đăng -->
                <p style="white-space: pre-line; font-size: 15px;"><%= post.content %></p><!-- pre-line giữ nguyên xuống dòng -->

                <!-- Ảnh đính kèm (nếu có) -->
                <% if (post.image) { %>
                    <img src="<%= post.image %>" class="img-fluid rounded mb-3"
                         style="max-height: 500px; width: 100%; object-fit: cover;"><!-- ảnh full width, crop vừa khung -->
                <% } %>

                <!-- Số lượt thích + bình luận -->
                <div class="d-flex justify-content-between" style="font-size: 13px; color: #65676b;">
                    <span><%= post.likes.length %> lượt thích</span>
                    <span><%= post.comments.length %> bình luận</span>
                </div>
                <hr class="my-2">

                <!-- Nút Like + Comment -->
                <div class="d-flex">
                    <form action="/posts/like/<%= post._id %>" method="POST" class="flex-fill"><!-- form like -->
                        <button type="submit" class="btn btn-light w-100 btn-sm">
                            <% if (post.likes.map(l => l.toString()).includes(currentUserId)) { %><!-- đã like → icon đầy + màu xanh -->
                                <i class="bi bi-hand-thumbs-up-fill text-primary"></i> Đã thích
                            <% } else { %><!-- chưa like → icon rỗng -->
                                <i class="bi bi-hand-thumbs-up"></i> Thích
                            <% } %>
                        </button>
                    </form>
                </div>

                <!-- Danh sách bình luận -->
                <div class="mt-3" style="max-height: 200px; overflow-y: auto;"><!-- giới hạn chiều cao, cuộn nếu nhiều -->
                    <% post.comments.forEach(c => { %><!-- duyệt từng bình luận -->
                        <div class="d-flex align-items-start mb-2">
                            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                 style="width: 32px; height: 32px; font-size: 12px; font-weight: 600; flex-shrink: 0;"><!-- avatar nhỏ -->
                                <%= c.username.charAt(0).toUpperCase() %>
                            </div>
                            <div class="ms-2 p-2" style="background: #f0f2f5; border-radius: 12px; font-size: 14px;"><!-- bong bóng chat -->
                                <strong style="font-size: 13px;"><%= c.username %></strong><!-- tên người bình luận -->
                                <div><%= c.text %></div><!-- nội dung -->
                            </div>
                        </div>
                    <% }) %>
                </div>

                <!-- Form bình luận -->
                <form action="/posts/comment/<%= post._id %>" method="POST" class="d-flex mt-2"><!-- form gửi bình luận -->
                    <input type="text" name="text" class="form-control form-control-sm me-2"
                           placeholder="Viết bình luận..." required
                           style="border-radius: 20px;"><!-- ô nhập bình luận bo tròn -->
                    <button type="submit" class="btn btn-primary btn-sm rounded-pill px-3">Gửi</button><!-- nút gửi -->
                </form>

            </div>
        </div>
    <% }) %>

    <!-- Không có bài đăng -->
    <% if (posts.length === 0) { %>
        <div class="text-center text-muted py-5"><!-- thông báo trống -->
            <i class="bi bi-newspaper" style="font-size: 48px;"></i>
            <p class="mt-2">Chưa có bài đăng nào. Hãy là người đầu tiên!</p>
        </div>
    <% } %>

</div>

<%- include('../partials/footer') %><!-- include footer -->
```
