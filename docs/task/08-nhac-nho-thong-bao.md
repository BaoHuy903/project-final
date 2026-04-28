# 8. Nhắc nhở thông báo

---

## File: public/js/calendar.js

### Yêu cầu quyền thông báo

```javascript
if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {// nếu trình duyệt hỗ trợ và chưa hỏi quyền (permission = "default")
    Notification.requestPermission();// hiện popup hỏi user cho phép gửi thông báo
}
```

---

### Phát tiếng bíp

```javascript
function playNotificationSound() {// phát âm thanh nhắc nhở bằng Web Audio API
    try {// bọc try/catch vì một số trình duyệt chặn phát âm thanh tự động
        const AudioCtx = window.AudioContext || window.webkitAudioContext;// lấy AudioContext (chuẩn hoặc Safari cũ)
        const ctx = new AudioCtx();// tạo audio context — môi trường xử lý âm thanh

        const osc = ctx.createOscillator();// tạo bộ dao động — tạo ra sóng âm thanh
        const gain = ctx.createGain();// tạo bộ điều chỉnh âm lượng

        osc.type = 'sine';// sóng sin — âm thanh mượt, dạng "bíp"
        osc.frequency.setValueAtTime(880, ctx.currentTime);// tần số 880Hz = nốt La cao (A5)
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);// giảm xuống 440Hz trong 0.1s → hiệu ứng "ting" đi xuống
        gain.gain.setValueAtTime(1, ctx.currentTime);// âm lượng 100% lúc bắt đầu
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);// giảm dần về 0 trong 0.5s → fade out

        osc.connect(gain);// nối oscillator → gain
        gain.connect(ctx.destination);// nối gain → loa (chuỗi: oscillator → gain → loa)
        osc.start();// bắt đầu phát
        osc.stop(ctx.currentTime + 0.5);// dừng sau 0.5 giây
    } catch (e) {
        console.log('Không thể phát âm thanh:', e);// trình duyệt chặn → log lỗi, bỏ qua
    }
}
```

---

### Gửi thông báo

```javascript
function pushNotification(title, body) {// gửi thông báo đến người dùng
    playNotificationSound();// phát tiếng bíp trước

    if ('Notification' in window && Notification.permission === 'granted') {// nếu đã cấp quyền
        new Notification('Nhắc nhở: ' + title, {// tạo notification hệ thống (hiện ở góc màn hình)
            body: body,// nội dung thông báo
            icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png'// icon lịch
        });
    } else {// chưa cấp quyền
        alert(`Nhắc nhở: ${title}\n${body}`);// dùng alert() thay thế
    }
}
```

---

### Kiểm tra nhắc nhở mỗi 30 giây

```javascript
setInterval(() => {// chạy lặp lại mỗi 30 giây
    if (typeof tasksData === 'undefined' || tasksData.length === 0) return;// không có task → bỏ qua
    const now = new Date();// lấy thời gian hiện tại

    tasksData.forEach(task => {// duyệt từng task
        if (task.reminder > 0 && task.date && task.time && !task._notified) {// có nhắc nhở, có ngày giờ, chưa thông báo

            const taskDateTime = new Date(`${task.date}T${task.time}:00`);// tạo Date từ ngày + giờ task
            const diffMs = taskDateTime - now;// chênh lệch (ms) giữa giờ task và hiện tại
            const diffMins = Math.floor(diffMs / 60000);// chuyển sang phút (60000ms = 1 phút)

            if (diffMins >= 0 && diffMins <= task.reminder) {// task ở tương lai VÀ còn ít hơn reminder phút
                pushNotification(task.title, `Công việc sẽ bắt đầu lúc ${task.time} (${diffMins} phút nữa).`);// gửi thông báo
                task._notified = true;// đánh dấu đã thông báo → lần sau bỏ qua
            }
        }
    });
}, 30000);// 30000ms = 30 giây
```
