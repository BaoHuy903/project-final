// Calendar initialization and event handling

// Helper: Format giờ dạng ngắn (vd: "03:00" -> "3am", "15:30" -> "3:30pm")
function formatTimeShort(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    let h = parseInt(parts[0]);
    const m = parseInt(parts[1] || 0);
    const suffix = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return m > 0 ? h + ':' + String(m).padStart(2, '0') + suffix : h + suffix;
}

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
        // Hiển thị sự kiện dưới dạng block
        eventDisplay: 'block',
        eventTextColor: '#fff',
        slotEventOverlap: false,

        // ✅ TÙY CHỈNH NỘI DUNG SỰ KIỆN: Hiển thị tên + khoảng thời gian
        eventContent: function(arg) {
            const props = arg.event.extendedProps;
            const title = arg.event.title || '';
            const time = props.time || '';
            const endTime = props.endTime || '';
            
            // Tạo label thời gian
            let timeLabel = '';
            if (time && time !== '00:00') {
                // Format giờ dạng ngắn gọn (vd: 3 – 4am)
                timeLabel = formatTimeShort(time);
                if (endTime && endTime.trim() !== '') {
                    timeLabel += ' – ' + formatTimeShort(endTime);
                }
            }

            const container = document.createElement('div');
            container.style.cssText = 'padding: 2px 4px; overflow: hidden; line-height: 1.3;';
            
            const titleEl = document.createElement('div');
            titleEl.style.cssText = 'font-weight: 600; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;';
            titleEl.textContent = title;
            container.appendChild(titleEl);
            
            if (timeLabel) {
                const timeEl = document.createElement('div');
                timeEl.style.cssText = 'font-size: 10px; opacity: 0.9; white-space: nowrap; color: #fff;';
                timeEl.textContent = timeLabel;
                container.appendChild(timeEl);
            }
            
            return { domNodes: [container] };
        },

        // SỰ KIỆN: Click vào ngày trên lịch để mở modal thêm công việc
        dateClick: function(info) {
            const dateInput = document.querySelector('#taskModal input[name="date"]');
            const endDateInput = document.querySelector('#taskModal input[name="endDate"]');
            
            // Tự động điền ngày vừa click vào ô Ngày bắt đầu và Ngày kết thúc
            if (dateInput) dateInput.value = info.dateStr;
            if (endDateInput) endDateInput.value = info.dateStr; 
            
            openNewTaskModal();
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
    const props = event.extendedProps;
    
    const startDateStr = event.start.toLocaleDateString('vi-VN');
    let endDateStr = startDateStr;

    if (props.endDate) {
        const endD = new Date(props.endDate);
        if (!isNaN(endD.getTime())) {
            endDateStr = endD.toLocaleDateString('vi-VN');
        }
    }

    let dateDisplay = startDateStr;
    if (startDateStr !== endDateStr) {
        dateDisplay = `${startDateStr} <span style="color: #5f6368; margin: 0 5px;">&rarr;</span> ${endDateStr}`;
    }
    
    const timeStr = props.time ? props.time : '00:00';
    const endTimeStr = (props.endTime && props.endTime.trim() !== '') 
        ? ` đến ${props.endTime}` : '';
    const reminderStr = props.reminder > 0 ? `Báo trước ${props.reminder} phút` : 'Không thông báo';

    // 👉 PHÂN QUYỀN VÀ HIỂN THỊ TRẠNG THÁI CHIA SẺ
    const isOwner = props.creatorId === props.currentUserId;
    const visibilityBadge = props.visibility === 'public' ? '🌍 Công khai' : (props.visibility === 'shared' ? '👥 Được chia sẻ' : '🔒 Cá nhân');
    const creatorName = props.creatorName || 'Không xác định';

    // 👉 XỬ LÝ HTML CHO FILE ĐÍNH KÈM
    let attachmentsHtml = '';
    if (props.attachments) {
        const files = props.attachments.split(',').filter(f => f.trim() !== '');
        
        if (files.length > 0) {
            attachmentsHtml = `
                <h6 style="color: #5f6368; margin-bottom: 8px; margin-top: 16px;">Tệp đính kèm</h6>
                <ul style="list-style: none; padding: 0;">
            `;
            
            files.forEach(file => {
                const fileName = file.split('/').pop();
                const extension = fileName.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
                
                if (isImage) {
                    attachmentsHtml += `
                        <li style="margin-bottom: 10px; display: flex; align-items: center;">
                            <img src="${file}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; margin-right: 10px;">
                            <a href="${file}" target="_blank" style="text-decoration: none; color: #1a73e8; word-break: break-all;">${fileName}</a>
                        </li>
                    `;
                } else {
                    let icon = '📄';
                    if (extension === 'pdf') icon = '📕';
                    if (['doc', 'docx'].includes(extension)) icon = '📘';
                    if (['xls', 'xlsx'].includes(extension)) icon = '📗';
                    
                    attachmentsHtml += `
                        <li style="margin-bottom: 10px; display: flex; align-items: center;">
                            <span style="font-size: 24px; margin-right: 10px;">${icon}</span>
                            <a href="${file}" target="_blank" style="text-decoration: none; color: #1a73e8; word-break: break-all;">${fileName}</a>
                        </li>
                    `;
                }
            });
            attachmentsHtml += '</ul>';
        }
    }

    // 👉 XỬ LÝ HTML CHO BÌNH LUẬN
    const comments = props.comments || [];
    let commentsHtml = `
        <div class="mt-4 pt-3 border-top">
            <h6 style="color: #5f6368; margin-bottom: 12px;"><i class="bi bi-chat-dots"></i> Bình luận (${comments.length})</h6>
            <div style="max-height: 200px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
    `;
    
    if (comments.length === 0) {
        commentsHtml += `<p style="font-size: 0.9rem; color: #aaa; margin: 0; text-align: center;">Chưa có bình luận nào.</p>`;
    } else {
        comments.forEach(c => {
            const date = new Date(c.createdAt).toLocaleString('vi-VN');
            const isMyComment = c.userId === props.currentUserId;
            const align = isMyComment ? 'text-end' : 'text-start';
            const bg = isMyComment ? '#d2e3fc' : '#e8eaed';
            
            commentsHtml += `
                <div class="${align} mb-3">
                    <small style="font-weight: bold; color: #555;">${c.username}</small>
                    <small style="color: #888; font-size: 0.7rem; margin-left: 5px;">(${date})</small>
                    <div style="background: ${bg}; padding: 8px 12px; border-radius: 12px; display: inline-block; max-width: 80%; text-align: left; margin-top: 4px;">
                        ${c.text}
                    </div>
                </div>
            `;
        });
    }
    commentsHtml += `</div>
        <form action="/comment/${event.id}" method="POST" class="d-flex">
            <input type="text" name="text" class="form-control me-2" placeholder="Nhập bình luận..." required style="border-radius: 20px;">
            <button type="submit" class="btn btn-primary" style="border-radius: 20px; white-space: nowrap;">Gửi</button>
        </form>
    </div>`;

    // 👉 GHÉP TOÀN BỘ GIAO DIỆN
    content.innerHTML = `
        <div>
            <div class="d-flex justify-content-between align-items-start">
                <h6 style="color: #5f6368; margin-bottom: 8px;">Tiêu đề <span class="badge bg-secondary ms-2">${visibilityBadge}</span></h6>
                <small class="text-muted">Tạo bởi: <strong>${isOwner ? 'Bạn' : creatorName}</strong></small>
            </div>
            <p style="margin-bottom: 16px; font-weight: 500; font-size: 1.1rem;">${event.title}</p>
            
            <div class="row">
                <div class="col-6">
                    <h6 style="color: #5f6368; margin-bottom: 8px;">Thời gian</h6>
                    <p style="margin-bottom: 16px;">
                        ${dateDisplay} <br>
                        <strong style="color: #1a73e8;">Lúc: ${timeStr}${endTimeStr}</strong>
                    </p>
                </div>
                <div class="col-6">
                    <h6 style="color: #5f6368; margin-bottom: 8px;">Nhắc nhở</h6>
                    <p style="margin-bottom: 16px;">${reminderStr}</p>
                </div>
            </div>

            <h6 style="color: #5f6368; margin-bottom: 8px;">Trạng thái</h6>
            <p style="margin-bottom: 16px;">
                <span class="badge" style="background-color: ${getStatusColor(props.status)}">
                    ${props.status}
                </span>
            </p>

            <h6 style="color: #5f6368; margin-bottom: 8px;">Mô tả chi tiết</h6>
            <p style="margin-bottom: 16px; background: #f8f9fa; padding: 10px; border-radius: 8px; white-space: pre-line;">
                ${props.description || 'Không có mô tả'}
            </p>

            ${attachmentsHtml} 
            ${commentsHtml}
        </div>
    `;
    
    // 👉 XỬ LÝ NÚT SỬA/XÓA (Chỉ hiện nếu là chủ sở hữu)
    const editBtn = document.getElementById('editTaskBtn');
    const deleteBtn = document.getElementById('deleteTaskBtn');
    
    if (isOwner) {
        editBtn.style.display = 'inline-block';
        deleteBtn.style.display = 'inline-block';
        
        editBtn.onclick = () => {
            window.location.href = `/edit/${event.id}`;
        };
        
        deleteBtn.onclick = () => {
            if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = `/delete/${event.id}`;
                document.body.appendChild(form);
                form.submit();
            }
        };
    } else {
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
    }
    
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

function playNotificationSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); 

        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); 

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.log("Trình duyệt chặn phát âm thanh:", e);
    }
}

function pushNotification(title, body) {
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