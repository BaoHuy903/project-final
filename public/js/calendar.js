// Format giờ dạng ngắn gọn (vd: "03:00" -> "3am", "15:30" -> "3:30pm")
function formatTimeShort(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    let h = parseInt(parts[0]);
    const m = parseInt(parts[1] || 0);
    const suffix = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return m > 0 ? h + ':' + String(m).padStart(2, '0') + suffix : h + suffix;
}

// Màu theo trạng thái
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

// ===== KHỞI TẠO LỊCH =====

document.addEventListener('DOMContentLoaded', function() {
    // Gán màu cho dot trạng thái
    document.querySelectorAll('.task-dot[data-color]').forEach(dot => {
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
        eventDisplay: 'block',
        eventTextColor: '#fff',
        slotEventOverlap: false,
        locale: 'vi',

        eventClick: function(info) {
            showTaskDetail(info.event);
        },

        // Tùy chỉnh nội dung hiển thị: Tiêu đề + khoảng thời gian
        eventContent: function(arg) {
            const props = arg.event.extendedProps;
            const title = arg.event.title || '';
            const time = props.time || '';
            const endTime = props.endTime || '';

            let timeLabel = '';
            if (time && time !== '00:00') {
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

        dateClick: function(info) {
            const dateInput = document.querySelector('#taskModal input[name="date"]');
            const endDateInput = document.querySelector('#taskModal input[name="endDate"]');
            if (dateInput) dateInput.value = info.dateStr;
            if (endDateInput) endDateInput.value = info.dateStr;
            openNewTaskModal();
        }
    });

    calendar.render();

    // Yêu cầu quyền thông báo
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
});

// ===== MODAL =====

function openNewTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

function showTaskDetail(event) {
    const modal = new bootstrap.Modal(document.getElementById('taskDetailModal'));
    const content = document.getElementById('taskDetailContent');
    const props = event.extendedProps;

    // Ngày hiển thị
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

    const timeStr = props.time || '00:00';
    const endTimeStr = (props.endTime && props.endTime.trim() !== '') ? ` đến ${props.endTime}` : '';
    const reminderStr = props.reminder > 0 ? `Báo trước ${props.reminder} phút` : 'Không thông báo';

    // Phân quyền
    const isOwner = props.creatorId === props.currentUserId;
    const visibilityBadge = props.visibility === 'public'
        ? '🌍 Công khai'
        : (props.visibility === 'shared' ? '👥 Được chia sẻ' : '🔒 Cá nhân');
    const creatorName = props.creatorName || 'Không xác định';

    // File đính kèm
    let attachmentsHtml = '';
    if (props.attachments) {
        const files = props.attachments.split(',').filter(f => f.trim() !== '');
        if (files.length > 0) {
            attachmentsHtml = `<h6 style="color: #5f6368; margin-bottom: 8px; margin-top: 16px;">Tệp đính kèm</h6><ul style="list-style: none; padding: 0;">`;
            files.forEach(file => {
                const fileName = file.split('/').pop();
                const ext = fileName.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

                if (isImage) {
                    attachmentsHtml += `
                        <li style="margin-bottom: 10px; display: flex; align-items: center;">
                            <img src="${file}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; margin-right: 10px;">
                            <a href="${file}" target="_blank" style="text-decoration: none; color: #1a73e8; word-break: break-all;">${fileName}</a>
                        </li>`;
                } else {
                    let icon = '📄';
                    if (ext === 'pdf') icon = '📕';
                    if (['doc', 'docx'].includes(ext)) icon = '📘';
                    if (['xls', 'xlsx'].includes(ext)) icon = '📗';
                    attachmentsHtml += `
                        <li style="margin-bottom: 10px; display: flex; align-items: center;">
                            <span style="font-size: 24px; margin-right: 10px;">${icon}</span>
                            <a href="${file}" target="_blank" style="text-decoration: none; color: #1a73e8; word-break: break-all;">${fileName}</a>
                        </li>`;
                }
            });
            attachmentsHtml += '</ul>';
        }
    }

    // Bình luận
    const comments = props.comments || [];
    let commentsHtml = `
        <div class="mt-4 pt-3 border-top">
            <h6 style="color: #5f6368; margin-bottom: 12px;"><i class="bi bi-chat-dots"></i> Bình luận (${comments.length})</h6>
            <div style="max-height: 200px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 8px; margin-bottom: 15px;">`;

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
                </div>`;
        });
    }
    commentsHtml += `</div>
        <form action="/comment/${event.id}" method="POST" class="d-flex">
            <input type="text" name="text" class="form-control me-2" placeholder="Nhập bình luận..." required style="border-radius: 20px;">
            <button type="submit" class="btn btn-primary" style="border-radius: 20px; white-space: nowrap;">Gửi</button>
        </form>
    </div>`;

    // Ghép giao diện
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
                <span class="badge" style="background-color: ${getStatusColor(props.status)}">${props.status}</span>
            </p>

            <h6 style="color: #5f6368; margin-bottom: 8px;">Mô tả chi tiết</h6>
            <p style="margin-bottom: 16px; background: #f8f9fa; padding: 10px; border-radius: 8px; white-space: pre-line;">
                ${props.description || 'Không có mô tả'}
            </p>

            ${attachmentsHtml}
            ${commentsHtml}
        </div>`;

    // Nút Sửa/Xóa (chỉ chủ sở hữu)
    const editBtn = document.getElementById('editTaskBtn');
    const deleteBtn = document.getElementById('deleteTaskBtn');

    if (isOwner) {
        editBtn.style.display = 'inline-block';
        deleteBtn.style.display = 'inline-block';
        editBtn.onclick = () => { window.location.href = `/edit/${event.id}`; };
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

function goToDate(dateStr) {
    console.log('Navigate to:', dateStr);
}

// ===== HỆ THỐNG THÔNG BÁO =====

function playNotificationSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.log('Không thể phát âm thanh:', e);
    }
}

function pushNotification(title, body) {
    playNotificationSound();
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nhắc nhở: ' + title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png'
        });
    } else {
        alert(`Nhắc nhở: ${title}\n${body}`);
    }
}

// Kiểm tra nhắc nhở mỗi 30 giây
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