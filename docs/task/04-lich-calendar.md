# 4. Hiển thị lịch (FullCalendar)

> Phần bình luận → xem [06-binh-luan.md](06-binh-luan.md)
> Phần đính kèm file → xem [07-dinh-kem-file.md](07-dinh-kem-file.md)
> Phần nhắc nhở/thông báo → xem [08-nhac-nho-thong-bao.md](08-nhac-nho-thong-bao.md)
> Phần chia sẻ & phân quyền → xem [05-chia-se-cong-viec.md](05-chia-se-cong-viec.md)

---

## File: public/js/calendar.js

### Hàm tiện ích

```javascript
function formatTimeShort(timeStr) {// đổi giờ "HH:mm" sang dạng ngắn (vd: "15:30" → "3:30pm")
    if (!timeStr) return '';// không có giá trị → trả về rỗng
    const parts = timeStr.split(':');// tách theo dấu : → ["15", "30"]
    let h = parseInt(parts[0]);// lấy phần giờ → 15
    const m = parseInt(parts[1] || 0);// lấy phần phút, mặc định 0
    const suffix = h >= 12 ? 'pm' : 'am';// >= 12 → pm, ngược lại → am
    h = h % 12 || 12;// chuyển sang hệ 12 giờ (15%12=3, 0%12=0 → ||12 đổi thành 12)
    return m > 0 ? h + ':' + String(m).padStart(2, '0') + suffix : h + suffix;// có phút → "3:30pm", không → "3pm"
}

function getColorByStatus(status) {// trả về mã màu theo trạng thái task
    const colors = {
        'Cần làm': '#c0392b',// đỏ
        'Đang làm': '#f39c12',// vàng cam
        'Hoàn thành': '#27ae60'// xanh lá
    };
    return colors[status] || '#9aa0a6';// trạng thái khác → xám
}

function getStatusColor(status) {// hàm alias, gọi lại getColorByStatus
    return getColorByStatus(status);
}
```

### Khởi tạo FullCalendar

```javascript
document.addEventListener('DOMContentLoaded', function () {// chạy khi trang HTML load xong

    document.querySelectorAll('.task-dot[data-color]').forEach(dot => {// tìm tất cả dot trạng thái ở sidebar
        dot.style.backgroundColor = dot.getAttribute('data-color');// gán màu nền từ data-color
    });

    const calendarEl = document.getElementById('calendar');// lấy element #calendar
    if (!calendarEl) return;// không tìm thấy → dừng

    const calendar = new FullCalendar.Calendar(calendarEl, {// tạo instance FullCalendar
        initialView: 'dayGridMonth',// mặc định: xem theo tháng
        headerToolbar: {// thanh công cụ
            left: 'prev today next',// trái: nút lùi/hôm nay/tiến
            center: 'title',// giữa: tiêu đề tháng
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'// phải: nút chuyển chế độ xem
        },
        height: 'auto',// chiều cao tự co giãn
        contentHeight: 'auto',// nội dung tự co giãn
        events: window.tasksData || [],// dữ liệu event từ index.ejs, không có thì mảng rỗng
        eventDisplay: 'block',// hiển thị event dạng khối (không phải chấm)
        eventTextColor: '#fff',// màu chữ event mặc định: trắng
        slotEventOverlap: false,// không cho event chồng lên nhau (chế độ tuần/ngày)
        locale: 'vi',// ngôn ngữ tiếng Việt
        nowIndicator: true,// hiển thị đường kẻ đỏ = thời điểm hiện tại
        scrollTime: '07:00:00',// mở chế độ tuần/ngày → cuộn đến 7h sáng
        slotMinTime: '06:00:00',// hiển thị từ 6h sáng
        slotMaxTime: '23:00:00',// đến 23h đêm
        allDayText: 'Cả ngày',// nhãn hàng all-day bằng tiếng Việt
        slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },// nhãn giờ dạng 24h (07:00, 14:00)

        eventClick: function (info) {// khi click vào event trên lịch
            showTaskDetail(info.event);// mở modal chi tiết task
        },

        eventContent: function (arg) {// tùy chỉnh nội dung hiển thị mỗi event
            const props = arg.event.extendedProps;// lấy thuộc tính mở rộng
            const title = arg.event.title || '';// tiêu đề
            const time = props.time || '';// giờ bắt đầu
            const endTime = props.endTime || '';// giờ kết thúc

            let timeLabel = '';// nhãn thời gian
            if (time && time !== '00:00') {// nếu có giờ (không phải 00:00)
                timeLabel = formatTimeShort(time);// format giờ bắt đầu
                if (endTime && endTime.trim() !== '') {// nếu có giờ kết thúc
                    timeLabel += ' – ' + formatTimeShort(endTime);// thêm " – 4pm"
                }
            }

            const container = document.createElement('div');// tạo div chứa nội dung
            container.style.cssText = 'padding: 2px 4px; overflow: hidden; line-height: 1.3;';

            const titleEl = document.createElement('div');// dòng tiêu đề
            titleEl.style.cssText = 'font-weight: 600; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;';
            titleEl.textContent = title;
            container.appendChild(titleEl);// thêm tiêu đề vào container

            if (timeLabel) {// nếu có nhãn thời gian
                const timeEl = document.createElement('div');// dòng giờ
                timeEl.style.cssText = 'font-size: 10px; opacity: 0.9; white-space: nowrap; color: #fff;';
                timeEl.textContent = timeLabel;
                container.appendChild(timeEl);// thêm giờ vào container
            }

            return { domNodes: [container] };// trả về DOM để FullCalendar render
        },

        dateClick: function (info) {// khi click vào ngày trống trên lịch
            const dateInput = document.querySelector('#taskModal input[name="date"]');// ô input ngày bắt đầu
            const endDateInput = document.querySelector('#taskModal input[name="endDate"]');// ô input ngày kết thúc
            if (dateInput) dateInput.value = info.dateStr;// tự điền ngày vừa click
            if (endDateInput) endDateInput.value = info.dateStr;// tự điền ngày kết thúc = ngày bắt đầu
            openNewTaskModal();// mở modal thêm task
        }
    });

    calendar.render();// render lịch ra màn hình

    // Yêu cầu quyền thông báo (chi tiết xem 08-nhac-nho-thong-bao.md)
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();// hỏi user cho phép gửi thông báo
    }
});
```

### Modal

```javascript
function openNewTaskModal() {// mở modal thêm task mới
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));// tạo Bootstrap Modal
    modal.show();// hiển thị
}
```

### showTaskDetail – Hiển thị chi tiết task

```javascript
function showTaskDetail(event) {// hiện modal chi tiết khi click vào event
    const modal = new bootstrap.Modal(document.getElementById('taskDetailModal'));// tạo modal
    const content = document.getElementById('taskDetailContent');// vùng hiển thị nội dung
    const props = event.extendedProps;// thuộc tính mở rộng của event

    // --- Xử lý ngày hiển thị ---
    const startDateStr = event.start.toLocaleDateString('vi-VN');// format ngày bắt đầu sang tiếng Việt
    let endDateStr = startDateStr;// mặc định endDate = startDate
    if (props.endDate) {// nếu có ngày kết thúc
        const endD = new Date(props.endDate);
        if (!isNaN(endD.getTime())) {// kiểm tra ngày hợp lệ
            endDateStr = endD.toLocaleDateString('vi-VN');// format ngày kết thúc
        }
    }
    let dateDisplay = startDateStr;// mặc định chỉ hiện 1 ngày
    if (startDateStr !== endDateStr) {// nếu nhiều ngày
        dateDisplay = `${startDateStr} → ${endDateStr}`;// hiện "28/4/2026 → 30/4/2026"
    }

    const timeStr = props.time || '00:00';// giờ bắt đầu, mặc định 00:00
    const endTimeStr = (props.endTime && props.endTime.trim() !== '') ? ` đến ${props.endTime}` : '';// giờ kết thúc
    const reminderStr = props.reminder > 0 ? `Báo trước ${props.reminder} phút` : 'Không thông báo';// chuỗi nhắc nhở

    // --- Phân quyền (chi tiết xem 05-chia-se-cong-viec.md) ---
    const isOwner = props.creatorId === props.currentUserId;// kiểm tra có phải chủ task không
    const visibilityBadge = props.visibility === 'public'// tạo badge quyền xem
        ? '🌍 Công khai'
        : (props.visibility === 'shared' ? '👥 Được chia sẻ' : '🔒 Cá nhân');
    const creatorName = props.creatorName || 'Không xác định';// tên người tạo

    // --- File đính kèm (chi tiết xem 07-dinh-kem-file.md) ---
    // ... xử lý hiển thị file ảnh (thumbnail) và file khác (icon emoji)

    // --- Bình luận (chi tiết xem 06-binh-luan.md) ---
    // ... xử lý hiển thị danh sách bình luận + form gửi bình luận mới

    content.innerHTML = `...`;// ghép tất cả HTML → gán vào modal

    // --- Nút Sửa/Xóa (chỉ chủ sở hữu) ---
    const editBtn = document.getElementById('editTaskBtn');// nút sửa
    const deleteBtn = document.getElementById('deleteTaskBtn');// nút xóa

    if (isOwner) {// nếu là chủ task
        editBtn.style.display = 'inline-block';// hiện nút sửa
        deleteBtn.style.display = 'inline-block';// hiện nút xóa
        editBtn.onclick = () => { window.location.href = `/edit/${event.id}`; };// click sửa → chuyển trang edit
        deleteBtn.onclick = () => {// click xóa
            if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {// hỏi xác nhận
                const form = document.createElement('form');// tạo form ẩn
                form.method = 'POST';
                form.action = `/delete/${event.id}`;// POST đến /delete/:id
                document.body.appendChild(form);
                form.submit();// submit form để xóa
            }
        };
    } else {// không phải chủ
        editBtn.style.display = 'none';// ẩn nút sửa
        deleteBtn.style.display = 'none';// ẩn nút xóa
    }

    modal.show();// hiển thị modal
}

function goToDate(dateStr) {// hàm placeholder, chưa hoàn thiện
    console.log('Navigate to:', dateStr);// chỉ ghi log
}
```

---

## File: views/tasks/index.ejs – Script chuyển đổi dữ liệu

```javascript
const tasksData = [ <% tasks.forEach((task, index) => { %> { ... } <% }) %> ];// EJS render mảng task từ server thành JS object

window.tasksData = (function() {// IIFE chuyển tasksData sang format FullCalendar
    const result = [];
    tasksData.forEach(task => {
        const isMultiDay = task.endDate && task.endDate !== task.date;// kiểm tra task nhiều ngày

        if (isMultiDay) {// task nhiều ngày → lặp từng ngày, mỗi ngày 1 event riêng
            // ...
        } else if (hasEndTime) {// cùng ngày, có giờ kết thúc → 1 event với start/end
            result.push({ start: date+'T'+time, end: date+'T'+endTime });
        } else if (task.time && task.time !== '00:00') {// chỉ có giờ bắt đầu → tự cộng 1h
            // ...
        } else {// task cả ngày → allDay: true
            result.push({ start: date, allDay: true });
        }
    });
    return result;
})();
```
