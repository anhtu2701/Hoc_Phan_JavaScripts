document.addEventListener("DOMContentLoaded", function () {
    // Toggle sidebar
    const mobileToggle = document.getElementById("mobile-toggle");
    const sidebar = document.getElementById("sidebar");

    mobileToggle?.addEventListener("click", function () {
        sidebar.classList.toggle("open");
    });

    // Logout functionality
    const logoutBtn = document.getElementById("logoutBtn");
    
    logoutBtn?.addEventListener("click", function () {
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/login/logout';
            document.body.appendChild(form);
            form.submit();
        }
    });

    // Status filter
    const statusFilter = document.getElementById("statusFilter");
    statusFilter?.addEventListener("change", function() {
        loadAllViewings(this.value);
    });

    // Load all dashboard data
    loadAllDashboardData();

    // Auto refresh every 5 minutes
    setInterval(loadAllDashboardData, 5 * 60 * 1000);

    // Manual refresh buttons
    document.getElementById("refreshDashboard")?.addEventListener("click", loadAllDashboardData);
    document.getElementById("refreshAllViewings")?.addEventListener("click", () => loadAllViewings());
});

// Load all dashboard data
async function loadAllDashboardData() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadAllViewings(),
            loadRecentActivities(),
        ]);
        
        updateLastRefreshTime();
        
    } catch (error) {
        console.error('Lỗi tải dữ liệu dashboard:', error);
        showNotification('Có lỗi khi tải dữ liệu', 'error');
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const elements = {
            totalUsers: document.getElementById('total-users'),
            totalRooms: document.getElementById('total-rooms'),
            todayViewings: document.getElementById('today-viewings'),
            monthlyViewings: document.getElementById('monthly-viewings'),
            availableRooms: document.getElementById('available-rooms'),
            occupiedRooms: document.getElementById('occupied-rooms'),
            occupancyRate: document.getElementById('occupancy-rate')
        };
        
        // Check if any element exists
        if (!elements.totalUsers) return;
        
        const response = await fetch('/api/dashboard/stats');
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Update main stats
            elements.totalUsers.textContent = data.totalUsers || '0';
            elements.totalRooms.textContent = data.totalRooms || '0';
            elements.todayViewings.textContent = data.todayViewings || '0';
            elements.monthlyViewings.textContent = data.monthlyViewings || '0';
            
            // Update room status
            elements.availableRooms.textContent = data.availableRooms || '0';
            elements.occupiedRooms.textContent = data.occupiedRooms || '0';
            elements.occupancyRate.textContent = (data.occupancyRate || 0) + '%';
            
            // Add animation effect
            animateCountUp(elements.totalUsers, data.totalUsers);
            animateCountUp(elements.totalRooms, data.totalRooms);
            animateCountUp(elements.todayViewings, data.todayViewings);
            animateCountUp(elements.monthlyViewings, data.monthlyViewings);
        }
    } catch (error) {
        console.error('Lỗi khi tải thống kê dashboard:', error);
    }
}

// Load all viewings thay vì today schedule
async function loadAllViewings(statusFilter = '') {
    try {
        const tbody = document.getElementById('allViewingsBody');
        if (!tbody) return;
        
        const url = statusFilter ? 
            `/api/dashboard/all-viewings?status=${statusFilter}` : 
            '/api/dashboard/all-viewings';
            
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center">Không có lịch xem phòng nào</td></tr>';
                return;
            }
            
            tbody.innerHTML = result.data.map(viewing => `
                <tr>
                    <td>${formatDateTime(viewing.createdAt)}</td>
                    <td>${formatDate(viewing.viewDate)}</td>
                    <td><strong>${viewing.timeSlot}</strong></td>
                    <td>${viewing.userName || 'N/A'}</td>
                    <td>
                        <div class="room-info">
                            <div class="room-title">${viewing.roomTitle || 'N/A'}</div>
                            <div class="room-id text-muted">${viewing.roomID || ''}</div>
                        </div>
                    </td>
                    <td>${viewing.roomAddress || 'N/A'}</td>
                    <td>
                        <div class="contact-info">
                            <div><i class="fas fa-envelope"></i> ${viewing.userEmail || 'N/A'}</div>
                            <div><i class="fas fa-phone"></i> ${viewing.userPhone || 'N/A'}</div>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge status-${viewing.status.toLowerCase()}">
                            ${getViewingStatusText(viewing.status)}
                        </span>
                    </td>
                    <td>
                        <div class="viewing-actions">
                            ${viewing.status === 'confirmed' ? `
                                <button class="btn-action complete" onclick="updateViewingStatus(${viewing.viewingID}, 'completed')">
                                    <i class="fa-check"></i> Hoàn thành
                                </button>
                                <button class="btn-action cancel" onclick="updateViewingStatus(${viewing.viewingID}, 'cancelled')">
                                    <i class="fa-times"></i> Hủy lịch
                                </button>
                            ` : ''}
                            ${viewing.status === 'completed' ? `
                                <span class="status-text success">
                                    <i class="fa-check-circle"></i> Đã hoàn thành
                                </span>
                            ` : ''}
                            ${viewing.status === 'cancelled' ? `
                                <span class="status-text cancelled">
                                    <i class="fa-times-circle"></i> Đã hủy
                                </span>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách lịch xem phòng:', error);
        const tbody = document.getElementById('allViewingsBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
        }
    }
}

// Cập nhật Load recent activities
async function loadRecentActivities() {
    try {
        const activitiesContainer = document.getElementById('recentActivitiesList');
        const loadingElement = document.getElementById('activitiesLoading');
        
        if (!activitiesContainer || !loadingElement) return;
        
        const response = await fetch('/api/dashboard/recent-activities');
        const result = await response.json();
        
        if (result.success) {
            loadingElement.style.display = 'none';
            activitiesContainer.style.display = 'block';
            
            if (result.data.length === 0) {
                activitiesContainer.innerHTML = '<div class="text-center">Không có hoạt động gần đây</div>';
                return;
            }
            
            activitiesContainer.innerHTML = result.data.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${getActivityIcon(activity.status)}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.activity}</div>
                        <div class="activity-time">${formatDateTime(activity.createdAt)}</div>
                    </div>
                </div>
            `).join('');
        } else {
            loadingElement.style.display = 'none';
            activitiesContainer.style.display = 'block';
            activitiesContainer.innerHTML = '<div class="text-center text-muted">Không có hoạt động gần đây</div>';
        }
    } catch (error) {
        console.error('Lỗi khi tải hoạt động gần đây:', error);
        const activitiesContainer = document.getElementById('recentActivitiesList');
        const loadingElement = document.getElementById('activitiesLoading');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (activitiesContainer) {
            activitiesContainer.style.display = 'block';
            activitiesContainer.innerHTML = '<div class="text-center text-danger">Lỗi khi tải hoạt động</div>';
        }
    }
}

// Cập nhật trạng thái lịch xem
async function updateViewingStatus(viewingID, status) {
    const actionText = status === 'completed' ? 'đánh dấu hoàn thành' : 'hủy lịch xem';
    
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} này không?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/dashboard/viewing/${viewingID}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`${status === 'completed' ? 'Đánh dấu hoàn thành' : 'Hủy lịch xem'} thành công`, 'success');
            
            // Reload dữ liệu
            const statusFilter = document.getElementById('statusFilter').value;
            loadAllViewings(statusFilter);
            loadDashboardStats();
            loadRecentActivities();
        } else {
            showNotification(result.message || 'Lỗi khi cập nhật trạng thái', 'error');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái lịch xem:', error);
        showNotification('Lỗi kết nối', 'error');
    }
}


function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
}

function formatDateTime(date) {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
}

function getViewingStatusText(status) {
    const statusMap = {
        'confirmed': 'Đã xác nhận',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const statusClasses = {
        'confirmed': 'confirmed',
        'completed': 'completed',
        'cancelled': 'cancelled'
    };
    return statusClasses[status] || 'default';
}

function getActivityIcon(status) {
    const iconMap = {
        'confirmed': 'fa-calendar-plus',
        'completed': 'fa-check-circle',
        'cancelled': 'fa-times-circle'
    };
    return iconMap[status] || 'fa-calendar';
}

function animateCountUp(element, target) {
    if (!element || !target) return;
    
    const start = 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * target);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function showNotification(message, type = 'info') {
    alert(message); // Tạm thời dùng alert, sau có thể thay bằng notification library
}

function updateLastRefreshTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Cập nhật lúc: ${new Date().toLocaleTimeString('vi-VN')}`;
    }
}


window.updateViewingStatus = updateViewingStatus;