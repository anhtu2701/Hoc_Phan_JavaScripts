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
        // Show confirmation dialog
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            // Create form and submit logout request
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/login/logout';

            
            document.body.appendChild(form);
            form.submit();
        }
    });

    // Load all dashboard data
    loadAllDashboardData();

    // Auto refresh every 5 minutes (không dùng real-time)
    setInterval(loadAllDashboardData, 5 * 60 * 1000);

    // Manual refresh buttons
    document.getElementById("refreshDashboard")?.addEventListener("click", loadAllDashboardData);
    document.getElementById("refreshPending")?.addEventListener("click", loadPendingRooms);
});

// Load all dashboard data
async function loadAllDashboardData() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadPendingRooms(), 
            loadRecentContracts(),
            loadCharts()
        ]);
        
        // Update last refresh time
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
            activeContracts: document.getElementById('active-contracts'),
            monthlyRevenue: document.getElementById('monthly-revenue'),
            availableRoomsCount: document.getElementById('availableRoomsCount'),
            occupiedRoomsCount: document.getElementById('occupiedRoomsCount'),
            occupancyRate: document.getElementById('occupancyRate'),
            newUsersThisMonth: document.getElementById('newUsersThisMonth')
        };
        
        // Check if any element exists (we might not be on main dashboard)
        if (!elements.totalUsers) return;
        
        const response = await fetch('/api/dashboard/stats');
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Update main stats
            elements.totalUsers.textContent = data.totalUsers || '0';
            elements.totalRooms.textContent = data.totalRooms || '0';
            elements.activeContracts.textContent = data.activeContracts || '0';
            elements.monthlyRevenue.textContent = formatCurrency(data.monthlyRevenue || 0);
            
            // Update system overview
            elements.availableRoomsCount.textContent = data.availableRooms || '0';
            elements.occupiedRoomsCount.textContent = data.occupiedRooms || '0';
            elements.occupancyRate.textContent = data.occupancyRate || '0';
            elements.newUsersThisMonth.textContent = data.newUsersThisMonth || '0';
            
            // Add animation effect
            animateCountUp(elements.totalUsers, data.totalUsers);
            animateCountUp(elements.totalRooms, data.totalRooms);
            animateCountUp(elements.activeContracts, data.activeContracts);
        }
    } catch (error) {
        console.error('Lỗi khi tải thống kê dashboard:', error);
    }
}

// Load pending rooms
async function loadPendingRooms() {
    try {
        const tbody = document.querySelector('#pendingApprovals tbody');
        if (!tbody) return;
        
        const response = await fetch('/api/dashboard/pending-rooms');
        const result = await response.json();
        
        if (result.success) {
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có phòng chờ duyệt</td></tr>';
                return;
            }
            
            tbody.innerHTML = result.data.map(room => `
                <tr>
                    <td>${room.MaPhong}</td>
                    <td>${room.TenChuNha || 'N/A'}</td>
                    <td>${room.TieuDe || 'N/A'}</td>
                    <td>${room.DiaChi || 'N/A'}</td>
                    <td>${formatCurrency(room.GiaThue)}</td>
                    <td>${formatDate(room.NgayTao)}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Lỗi khi tải phòng chờ duyệt:', error);
    }
}

// Load recent contracts
async function loadRecentContracts() {
    try {
        const tbody = document.getElementById('contractsTableBody');
        if (!tbody) return;
        
        const response = await fetch('/api/dashboard/recent-contracts');
        const result = await response.json();
        
        if (result.success) {
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có hợp đồng nào</td></tr>';
                return;
            }
            
            tbody.innerHTML = result.data.map(contract => `
                <tr>
                    <td>${contract.MaHopDong}</td>
                    <td>${contract.MaPhong}</td>
                    <td>${contract.TenNguoiThue || 'N/A'}</td>
                    <td>${formatDate(contract.NgayBatDau)}</td>
                    <td>
                        <span class="status-badge ${getStatusClass(contract.TrangThai)}">
                            ${getStatusText(contract.TrangThai)}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Lỗi khi tải hợp đồng gần đây:', error);
    }
}

// Load charts (Chart.js)
async function loadCharts() {
    // Chỉ load chart nếu có element
    if (document.getElementById('revenueChart')) {
        await loadRevenueChart();
    }
    if (document.getElementById('roomStatusChart')) {
        await loadRoomStatusChart();
    }
}

// Revenue chart
async function loadRevenueChart() {
    try {
        const response = await fetch('/api/dashboard/revenue-chart');
        const result = await response.json();
        
        if (result.success) {
            const ctx = document.getElementById('revenueChart').getContext('2d');
            
            // Destroy existing chart if exists
            if (window.revenueChart instanceof Chart) {
                window.revenueChart.destroy();
            }
            
            window.revenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: result.data.months,
                    datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: result.data.revenue,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#3498db',
                        pointBorderColor: '#2980b9',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Doanh thu: ' + formatCurrency(context.parsed.y);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatCurrencyShort(value);
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Lỗi tải biểu đồ doanh thu:', error);
    }
}

// Room status chart  
async function loadRoomStatusChart() {
    try {
        const response = await fetch('/api/dashboard/room-status-chart');
        const result = await response.json();
        
        if (result.success) {
            const ctx = document.getElementById('roomStatusChart').getContext('2d');
            
            // Destroy existing chart if exists
            if (window.roomStatusChart instanceof Chart) {
                window.roomStatusChart.destroy();
            }
            
            window.roomStatusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Phòng trống', 'Đã thuê', 'Chờ duyệt', 'Đã duyệt'],
                    datasets: [{
                        data: [
                            result.data.available,
                            result.data.occupied,
                            result.data.pending,
                            result.data.approved
                        ],
                        backgroundColor: [
                            '#2ecc71', // Xanh lá - trống
                            '#e74c3c', // Đỏ - đã thuê
                            '#f39c12', // Cam - chờ duyệt  
                            '#3498db'  // Xanh dương - đã duyệt
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Lỗi tải biểu đồ trạng thái phòng:', error);
    }
}

// === UTILITY FUNCTIONS ===

function formatCurrency(amount) {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatCurrencyShort(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toString();
}

function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
}

function getStatusClass(status) {
    const statusMap = {
        'dangThue': 'active',
        'choDuyet': 'pending', 
        'daKetThuc': 'completed',
        'biHuy': 'cancelled'
    };
    return statusMap[status] || 'unknown';
}

function getStatusText(status) {
    const statusMap = {
        'dangThue': 'Đang thuê',
        'choDuyet': 'Chờ duyệt',
        'daKetThuc': 'Đã kết thúc', 
        'biHuy': 'Bị hủy'
    };
    return statusMap[status] || status;
}

// Animation effect for counting up
function animateCountUp(element, target) {
    const start = 0;
    const duration = 1000; // 1 second
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

// Show notification
function showNotification(message, type = 'info') {
    // Simple notification - có thể dùng toast library sau
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Update last refresh time
function updateLastRefreshTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    
    // Có thể hiển thị thời gian refresh cuối cùng
    const lastUpdate = document.getElementById('lastUpdate');
    if (lastUpdate) {
        lastUpdate.textContent = `Cập nhật lần cuối: ${timeStr}`;
    }
}