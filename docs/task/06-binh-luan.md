# 6. Bình luận

---

## File: models/task.js

```javascript
    comments: [{// mảng bình luận nhúng trong task (embedded document)
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// id người tạo bình luận
        username: String,// tên người tạo bình luận (lưu thẳng để không cần populate)
        text: String,// nội dung bình luận
        createdAt: { type: Date, default: Date.now }// thời gian tạo, tự động bằng Date.now
    }]
```

---

## File: controllers/taskController.js

```javascript
exports.addComment = async (req, res) => {// xử lý POST /comment/:id
    const { text } = req.body;// lấy nội dung bình luận từ form

    if (!text || text.trim() === '') return res.redirect('/');// text rỗng → redirect, không thêm

    await Task.findByIdAndUpdate(req.params.id, {// tìm task theo id từ URL
        $push: {// toán tử MongoDB: thêm 1 phần tử vào cuối mảng
            comments: {
                userId: req.session.userId,// id người viết = user đang login
                username: req.session.username,// tên người viết
                text: text.trim()// nội dung, trim() xóa khoảng trắng thừa
            }
        }
    });

    res.redirect('/');// redirect về trang chủ (reload lịch)
};
```

---

## File: public/js/calendar.js – Hiển thị bình luận

```javascript
    const comments = props.comments || [];// lấy mảng comments, không có thì mảng rỗng

    if (comments.length === 0) {// không có bình luận
        commentsHtml += '<p>Chưa có bình luận nào.</p>';// hiện thông báo trống
    }

    comments.forEach(c => {// duyệt từng bình luận
        const date = new Date(c.createdAt).toLocaleString('vi-VN');// format thời gian sang "28/04/2026, 15:30:00"
        const isMyComment = c.userId === props.currentUserId;// kiểm tra bình luận này có phải của mình không
        const align = isMyComment ? 'text-end' : 'text-start';// của mình → căn phải, người khác → căn trái
        const bg = isMyComment ? '#d2e3fc' : '#e8eaed';// của mình → nền xanh nhạt, người khác → nền xám (giống chat)

        commentsHtml += `
            <div class="${align} mb-3"><!-- khung bình luận -->
                <small style="font-weight: bold;">${c.username}</small><!-- tên người viết -->
                <small>(${date})</small><!-- thời gian -->
                <div style="background: ${bg}; padding: 8px 12px; border-radius: 12px;"><!-- nội dung bo tròn -->
                    ${c.text}
                </div>
            </div>`;
    });

    commentsHtml += `
        <form action="/comment/${event.id}" method="POST" class="d-flex"><!-- form gửi bình luận mới -->
            <input type="text" name="text" placeholder="Nhập bình luận..." required><!-- ô nhập nội dung -->
            <button type="submit">Gửi</button><!-- nút gửi → POST /comment/:id -->
        </form>`;
```
