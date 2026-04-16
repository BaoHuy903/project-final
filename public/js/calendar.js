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

    // Yêu cầu quyền gửi thông báo khi trang load
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }
});

function openNewTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

function showTaskDetail(event) {
    const modal = new bootstrap.Modal(document.getElementById('taskDetailModal'));
    const content = document.getElementById('taskDetailContent');
    
    const timeStr = event.extendedProps.time ? event.extendedProps.time : '00:00';
    const reminderStr = event.extendedProps.reminder > 0 ? `Báo trước ${event.extendedProps.reminder} phút` : 'Không thông báo';

    content.innerHTML = `
        <div>
            <h6 style="color: #5f6368; margin-bottom: 8px;">Tiêu đề</h6>
            <p style="margin-bottom: 16px; font-weight: 500; font-size: 1.1rem;">${event.title}</p>
            
            <div class="row">
                <div class="col-6">
                    <h6 style="color: #5f6368; margin-bottom: 8px;">Thời gian</h6>
                    <p style="margin-bottom: 16px;">
                        ${event.start.toLocaleDateString('vi-VN')} <br>
                        <strong>Lúc: ${timeStr}</strong>
                    </p>
                </div>
                <div class="col-6">
                    <h6 style="color: #5f6368; margin-bottom: 8px;">Nhắc nhở</h6>
                    <p style="margin-bottom: 16px;">${reminderStr}</p>
                </div>
            </div>

            <h6 style="color: #5f6368; margin-bottom: 8px;">Trạng thái</h6>
            <p style="margin-bottom: 16px;">
                <span class="badge" style="background-color: ${getStatusColor(event.extendedProps.status)}">
                    ${event.extendedProps.status}
                </span>
            </p>

            <h6 style="color: #5f6368; margin-bottom: 8px;">Mô tả chi tiết</h6>
            <p style="margin-bottom: 16px; background: #f8f9fa; padding: 10px; border-radius: 8px;">
                ${event.extendedProps.description || 'Không có mô tả'}
            </p>
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
// HỆ THỐNG THÔNG BÁO CÓ ÂM THANH (TỰ TẠO TIẾNG BÍP)
// ==========================================

// Hàm tự tạo âm thanh "Ting"
function playNotificationSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine'; // Loại sóng âm thanh
        osc.frequency.setValueAtTime(880, ctx.currentTime); // Tần số nốt cao
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Hạ tone tạo độ vang

        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); // Nhỏ dần và tắt sau 0.5s

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.log("Trình duyệt chặn phát âm thanh:", e);
    }
}

function pushNotification(title, body) {
    // Phát âm thanh
    playNotificationSound();

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Nhắc nhở công việc: " + title, {
            body: body,
            icon: "https://cdn-icons-png.flaticon.com/512/2693/2693507.png"
        });
    } else {
        alert(`🔔 NHẮC NHỞ: ${title}\n${body}`);
    }
}

// Chạy ngầm kiểm tra mỗi 30 giây
setInterval(() => {
    if (typeof tasksData === 'undefined' || tasksData.length === 0) return;

    const now = new Date();

    tasksData.forEach(task => {
        if (task.reminder > 0 && task.date && task.time && !task._notified) {
            const taskDateTime = new Date(`${task.date}T${task.time}:00`);
            const diffMs = taskDateTime - now;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins >= 0 && diffMins <= task.reminder) {
                pushNotification(task.title, `Công việc sẽ bắt đầu lúc ${task.time} (${diffMins} phút nữa).`);
                task._notified = true; 
            }
        }
    });
}, 30000);