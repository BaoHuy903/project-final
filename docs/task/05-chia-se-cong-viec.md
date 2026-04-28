# 5. Chia sẻ công việc

---

## File: models/task.js

```javascript
    visibility: {// quyền xem task
        type: String,
        enum: ['private', 'public', 'shared'],// private = chỉ mình, public = tất cả, shared = người được chọn
        default: 'private'// mặc định chỉ mình tôi xem
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],// mảng id user được chia sẻ, tham chiếu đến User
```

---

## File: controllers/taskController.js

```javascript
    const tasks = await Task.find({// truy vấn MongoDB
        $or: [// toán tử $or: thỏa BẤT KỲ 1 trong 3 điều kiện
            { user: req.session.userId },// task do mình tạo
            { visibility: 'public' },// task công khai
            { sharedWith: req.session.userId }// task được chia sẻ cho mình
        ]
    });
```

---

## File: views/tasks/new.ejs

```html
<select name="visibility" id="visibilitySelect"><!-- dropdown chọn quyền xem -->
    <option value="private">Chỉ mình tôi (Private)</option><!-- chỉ mình xem -->
    <option value="public">Tất cả mọi người (Public)</option><!-- ai cũng xem được -->
    <option value="shared">Chia sẻ với người cụ thể</option><!-- chọn người -->
</select>

<div id="sharedWithDiv" style="display: none;"><!-- ẩn mặc định, chỉ hiện khi chọn "shared" -->
    <select name="sharedWith" multiple style="height: 100px;"><!-- multi-select, giữ Ctrl + click để chọn nhiều -->
        <% users.forEach(u => { %><!-- duyệt danh sách user (trừ mình) -->
            <option value="<%= u._id %>"><%= u.username %></option><!-- mỗi option = 1 user -->
        <% }) %>
    </select>
</div>
```

```javascript
document.getElementById('visibilitySelect').addEventListener('change', function() {// lắng nghe thay đổi dropdown
    document.getElementById('sharedWithDiv').style.display =
        this.value === 'shared' ? 'block' : 'none';// chọn "shared" → hiện ô chọn user, khác → ẩn
});
```

---

## File: views/tasks/edit.ejs (Tải lại trạng thái quyền riêng tư)

```html
<select name="visibility" id="visibilitySelect"><!-- dropdown tải lại trạng thái quyền xem cũ -->
    <option value="private" <%= task.visibility === 'private' ? 'selected' : '' %>>Chỉ mình tôi (Private)</option>
    <option value="public" <%= task.visibility === 'public' ? 'selected' : '' %>>Tất cả mọi người (Public)</option>
    <option value="shared" <%= task.visibility === 'shared' ? 'selected' : '' %>>Chia sẻ với người cụ thể</option>
</select>

<!-- Nếu task đang chia sẻ, hiện sẵn ô chọn user, ngược lại thì ẩn -->
<div id="sharedWithDiv" style="display: <%= task.visibility === 'shared' ? 'block' : 'none' %>;">
    <select name="sharedWith" multiple style="height: 100px;">
        <% 
            const sharedList = task.sharedWith ? task.sharedWith.map(id => id.toString()) : [];
            users.forEach(u => { 
        %><!-- duyệt user và tick chọn sẵn những ai nằm trong danh sách đã chia sẻ -->
            <option value="<%= u._id %>" <%= sharedList.includes(u._id.toString()) ? 'selected' : '' %>><%= u.username %></option>
        <% }) %>
    </select>
</div>
```

---

## File: public/js/calendar.js

```javascript
    const isOwner = props.creatorId === props.currentUserId;// so sánh id người tạo với id user đang login → xác định có phải chủ không

    const visibilityBadge = props.visibility === 'public'// tạo badge hiển thị quyền xem
        ? '🌍 Công khai'
        : (props.visibility === 'shared' ? '👥 Được chia sẻ' : '🔒 Cá nhân');

    if (isOwner) {// nếu là chủ task
        editBtn.style.display = 'inline-block';// hiện nút Sửa
        deleteBtn.style.display = 'inline-block';// hiện nút Xóa
    } else {// không phải chủ (chỉ được chia sẻ)
        editBtn.style.display = 'none';// ẩn nút Sửa
        deleteBtn.style.display = 'none';// ẩn nút Xóa → chỉ xem và bình luận
    }
```
