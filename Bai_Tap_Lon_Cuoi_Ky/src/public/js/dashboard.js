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

    // Load dashboard data
    loadDashboardStats();
    loadPendingRooms();

    // Refresh buttons
    const refreshDashboard = document.getElementById("refreshDashboard");
    const refreshPending = document.getElementById("refreshPending");

    refreshDashboard?.addEventListener("click", function() {
        loadDashboardStats();
    });

    refreshPending?.addEventListener("click", function() {
        loadPendingRooms();
    });
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Check if elements exist before proceeding
        const totalUsersEl = document.getElementById('total-users');
        const totalRoomsEl = document.getElementById('total-rooms');
        const activeContractsEl = document.getElementById('active-contracts');
        const monthlyRevenueEl = document.getElementById('monthly-revenue');
        
        if (!totalUsersEl || !totalRoomsEl || !activeContractsEl || !monthlyRevenueEl) {
            // Elements don't exist, skip this function (probably not on main dashboard)
            return;
        }
        
        const response = await fetch('/api/dashboard/stats');
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Update stat cards
            totalUsersEl.textContent = data.totalUsers;
            totalRoomsEl.textContent = data.totalRooms;
            activeContractsEl.textContent = data.activeContracts;
            monthlyRevenueEl.textContent = formatCurrency(data.monthlyRevenue);
        }
    } catch (error) {
        console.error('Lỗi khi tải thống kê dashboard:', error);
    }
}

// Load pending rooms
async function loadPendingRooms() {
    try {
        // Check if element exists before proceeding
        const tbody = document.querySelector('#pendingApprovals tbody');
        if (!tbody) {
            // Element doesn't exist, skip this function
            return;
        }
        
        const response = await fetch('/api/dashboard/pending-rooms');
        const result = await response.json();
        
        if (result.success) {
            tbody.innerHTML = '';
            
            result.data.forEach(room => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${room.MaPhong}</td>
                    <td>${room.MaChuNha}</td>
                    <td>${room.TieuDe}</td>
                    <td>${room.DiaChi}</td>
                    <td>${formatCurrency(room.GiaThue)}</td>
                    <td>${formatDate(room.NgayTao)}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách phòng chờ duyệt:', error);
    }
}

// Utility functions
function formatCurrency(amount) {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
}
