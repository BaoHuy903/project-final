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
