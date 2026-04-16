// Calendar initialization and event handling
document.addEventListener('DOMContentLoaded', function() {
    // Set task dot colors from data attribute
    const taskDots = document.querySelectorAll('.task-dot[data-color]');
    taskDots.forEach(dot => {
        dot.style.backgroundColor = dot.getAttribute('data-color');
    });
    
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) return;
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev today next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        height: 'auto',
        contentHeight: 'auto',
        events: window.tasksData || [],
        eventClick: function(info) {
            showTaskDetail(info.event);
        },
        locale: 'vi'
    });
    
    calendar.render();
});

function openNewTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

function showTaskDetail(event) {
    const modal = new bootstrap.Modal(document.getElementById('taskDetailModal'));
    const content = document.getElementById('taskDetailContent');
    
    content.innerHTML = `
        <div>
            <h6 style="color: #5f6368; margin-bottom: 8px;">Tiêu đề</h6>
            <p style="margin-bottom: 16px; font-weight: 500;">${event.title}</p>
            
            <h6 style="color: #5f6368; margin-bottom: 8px;">Mô tả</h6>
            <p style="margin-bottom: 16px;">${event.extendedProps.description || 'Không có'}</p>
            
            <h6 style="color: #5f6368; margin-bottom: 8px;">Ngày</h6>
            <p style="margin-bottom: 16px;">${event.start.toLocaleDateString('vi-VN')}</p>
            
            <h6 style="color: #5f6368; margin-bottom: 8px;">Trạng thái</h6>
            <p><span class="badge" style="background-color: ${getStatusColor(event.extendedProps.status)}">${event.extendedProps.status}</span></p>
        </div>
    `;
    
    document.getElementById('editTaskBtn').onclick = () => {
        window.location.href = `/edit/${event.id}`;
    };
    
    document.getElementById('deleteTaskBtn').onclick = () => {
        if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/delete/${event.id}`;
            document.body.appendChild(form);
            form.submit();
        }
    };
    
    modal.show();
}

function getColorByStatus(status) {
    const colors = {
        'Cần làm': '#c0392b',
        'Đang làm': '#f39c12',
        'Hoàn thành': '#27ae60'
    };
    return colors[status] || '#9aa0a6';
}

function getStatusColor(status) {
    return getColorByStatus(status);
}

function goToDate(dateStr) {
    console.log('Navigate to:', dateStr);
}


// ==========================================
// HỆ THỐNG THÔNG BÁO (NOTIFICATION SYSTEM)
// ==========================================

// 1. Xin quyền gửi thông báo từ máy tính người dùng
document.addEventListener('DOMContentLoaded', () => {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }
});

// 2. Hàm bắn thông báo ra màn hình
function pushNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification("Task Manager: " + title, {
            body: body,
            icon: "https://cdn-icons-png.flaticon.com/512/2693/2693507.png" // Icon cái lịch cho giống GG
        });
    } else {
        // Fallback: Nếu họ chặn quyền notification, dùng alert thường
        alert(`🔔 NHẮC NHỞ: ${title}\n${body}`);
    }
}

// 3. Vòng lặp kiểm tra thời gian (chạy ngầm mỗi 30 giây)
setInterval(() => {
    if (!window.tasksData || window.tasksData.length === 0) return;

    const now = new Date();

    tasksData.forEach(task => {
        // Chỉ xử lý nếu có bật nhắc nhở và chưa bị báo rồi (dùng _notified để đánh dấu)
        if (task.reminder > 0 && task.date && task.time && !task._notified) {
            
            // Gộp ngày và giờ lại để tính toán (vd: 2026-04-16T14:30:00)
            const taskDateTime = new Date(`${task.date}T${task.time}:00`);
            
            // Tính khoảng cách thời gian (ra mili-giây, sau đó đổi ra phút)
            const diffMs = taskDateTime - now;
            const diffMins = Math.floor(diffMs / 60000);

            // Bắn thông báo nếu thời gian chênh lệch <= thời gian đã cài đặt (Và lớn hơn 0 để tránh báo việc đã qua)
            if (diffMins > 0 && diffMins <= task.reminder) {
                pushNotification(task.title, `Sự kiện sẽ bắt đầu sau ${diffMins} phút nữa (lúc ${task.time}).`);
                
                // Đánh dấu là đã báo rồi để giây tiếp theo không bị lặp lại còi réo
                task._notified = true; 
            }
        }
    });
}, 30000); // 30,000 ms = 30 giây kiểm tra 1 lần