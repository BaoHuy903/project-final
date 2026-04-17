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
    
    // 1. Tạo HTML cơ bản cho chi tiết công việc
    let htmlContent = `
        <div>
            <h6 style="color: #5f6368; margin-bottom: 8px;">Tiêu đề</h6>
            <p style="margin-bottom: 16px; font-weight: 500;">${event.title}</p>
            
            <h6 style="color: #5f6368; margin-bottom: 8px;">Mô tả</h6>
            <p style="margin-bottom: 16px;">${event.extendedProps.description || 'Không có'}</p>
            
            <h6 style="color: #5f6368; margin-bottom: 8px;">Ngày</h6>
            <p style="margin-bottom: 16px;">${event.start.toLocaleDateString('vi-VN')}</p>
            
            <h6 style="color: #5f6368; margin-bottom: 8px;">Trạng thái</h6>
            <p><span class="badge" style="background-color: ${getStatusColor(event.extendedProps.status)}">${event.extendedProps.status}</span></p>
    `;

    // 2. Xử lý hiển thị danh sách file đính kèm
    const attachmentsStr = event.extendedProps.attachments; // Dữ liệu đang là chuỗi "file1.jpg,file2.pdf"
    
    // Nếu có chuỗi đính kèm và không rỗng
    if (attachmentsStr && attachmentsStr.trim() !== "") {
        // Tách chuỗi thành mảng dựa vào dấu phẩy
        const attachments = attachmentsStr.split(',');
        
        htmlContent += `
            <div style="border-top: 1px solid #dadce0; margin-top: 16px; padding-top: 16px;">
                <h6 style="color: #5f6368; margin-bottom: 12px;">Tệp đính kèm (${attachments.length})</h6>
                <div style="display: flex; flex-direction: column; gap: 10px;">
        `;

        attachments.forEach(fileUrl => {
            const url = fileUrl.trim();
            if (!url) return; // Bỏ qua nếu url rỗng
            
            // Kiểm tra đuôi file xem có phải là ảnh không
            const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
            const fileName = url.split('/').pop() || 'Xem tệp đính kèm'; // Lấy tên file từ URL
            
            if (isImage) {
                // Nếu là ảnh -> Hiển thị ảnh
                htmlContent += `
                    <div>
                        <a href="/${url.replace(/^\/+/, '')}" target="_blank">
                            <img src="/${url.replace(/^\/+/, '')}" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #dadce0; object-fit: contain;">
                        </a>
                    </div>`;
            } else {
                // Nếu là Word, PDF... -> Hiển thị nút bấm
                htmlContent += `
                    <div>
                        <a href="/${url.replace(/^\/+/, '')}" target="_blank" style="display: inline-block; padding: 6px 12px; background: #f1f3f4; color: #1a73e8; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                            📄 ${fileName}
                        </a>
                    </div>`;
            }
        });

        htmlContent += `</div></div>`;
    }

    htmlContent += `</div>`;
    
    // 3. Gắn HTML vào Modal
    content.innerHTML = htmlContent;
    
    // 4. Xử lý sự kiện cho nút Sửa / Xóa
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
