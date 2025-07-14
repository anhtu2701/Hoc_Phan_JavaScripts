class UsersManagement {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 0;
        this.currentSearch = '';
        this.currentRoleFilter = '';
        this.currentStatusFilter = '';
        this.selectedUsers = [];
        this.isLoading = false;
        this.currentUserId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStats();
        this.loadUsers();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = this.debounce((e) => {
                this.currentSearch = e.target.value.trim();
                this.currentPage = 1;
                this.loadUsers();
            }, 300);
            searchInput.addEventListener('input', debouncedSearch);
        }

        // Filter functionality
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (roleFilter) {
            roleFilter.addEventListener('change', (e) => {
                this.currentRoleFilter = e.target.value;
                this.currentPage = 1;
                this.loadUsers();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentStatusFilter = e.target.value;
                this.currentPage = 1;
                this.loadUsers();
            });
        }

        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.openAddUserModal();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshUsersBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadUsers();
                this.loadStats();
                this.showSuccess('Dữ liệu đã được làm mới');
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.handleSelectAll(e.target.checked);
            });
        }

        // Bulk actions
        const bulkAction = document.getElementById('bulkAction');
        const applyBulkAction = document.getElementById('applyBulkAction');
        
        if (bulkAction && applyBulkAction) {
            applyBulkAction.addEventListener('click', () => {
                this.handleBulkAction();
            });
        }

        // Update table subtitle with current filters
        this.updateTableSubtitle();

        this.bindModalEvents();
    }

    bindModalEvents() {
        // User modal events
        const userModal = document.getElementById('userModal');
        const closeUserModal = document.getElementById('closeUserModal');
        const cancelUserBtn = document.getElementById('cancelUserBtn');
        const saveUserBtn = document.getElementById('saveUserBtn');

        if (closeUserModal) {
            closeUserModal.addEventListener('click', () => {
                this.closeModal('userModal');
            });
        }

        if (cancelUserBtn) {
            cancelUserBtn.addEventListener('click', () => {
                this.closeModal('userModal');
            });
        }

        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', () => {
                this.saveUser();
            });
        }

        // Status modal events
        const statusModal = document.getElementById('statusModal');
        const closeStatusModal = document.getElementById('closeStatusModal');
        const cancelStatusBtn = document.getElementById('cancelStatusBtn');
        const saveStatusBtn = document.getElementById('saveStatusBtn');

        if (closeStatusModal) {
            closeStatusModal.addEventListener('click', () => {
                this.closeModal('statusModal');
            });
        }

        if (cancelStatusBtn) {
            cancelStatusBtn.addEventListener('click', () => {
                this.closeModal('statusModal');
            });
        }

        if (saveStatusBtn) {
            saveStatusBtn.addEventListener('click', () => {
                this.saveUserStatus();
            });
        }

        // Delete modal events
        const deleteModal = document.getElementById('deleteModal');
        const closeDeleteModal = document.getElementById('closeDeleteModal');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

        if (closeDeleteModal) {
            closeDeleteModal.addEventListener('click', () => {
                this.closeModal('deleteModal');
            });
        }

        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                this.closeModal('deleteModal');
            });
        }

        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.confirmDelete();
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    async loadStats() {
        try {
            const response = await fetch('/api/users/stats');
            const result = await response.json();

            if (result.success) {
                this.updateStatsDisplay(result.data);
            } else {
                console.error('Error loading stats:', result.message);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        const elements = {
            totalUsers: stats.totalUsers || 0,
            owners: stats.ownersCount || 0,
            tenants: stats.tenantsCount || 0,
            newUsers: stats.newUsersCount || 0
        };

        Object.entries(elements).forEach(([dataAttr, value]) => {
            const element = document.querySelector(`[data-stat="${dataAttr}"]`);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async loadUsers() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.pageSize,
                search: this.currentSearch,
                role: this.currentRoleFilter,
                status: this.currentStatusFilter
            });

            const response = await fetch(`/api/users?${params}`);
            const result = await response.json();

            if (result.success) {
                this.renderUsers(result.data.users);
                this.totalPages = result.data.pagination.totalPages;
                this.updatePagination(result.data);
                this.updateTableSubtitle();
            } else {
                this.showError(result.message || 'Lỗi khi tải danh sách người dùng');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Lỗi kết nối khi tải danh sách người dùng');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>Không có người dùng nào được tìm thấy</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr data-user-id="${user.MaNguoiDung}">
                <td>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" class="custom-checkbox user-checkbox" value="${user.MaNguoiDung}" id="user-${user.MaNguoiDung}">
                        <label for="user-${user.MaNguoiDung}" class="checkbox-label"></label>
                    </div>
                </td>
                <td><span class="text-truncate" title="${user.CCCD}">${user.CCCD}</span></td>
                <td><span class="text-truncate" title="${user.TenDangNhap}">${user.TenDangNhap}</span></td>
                <td><span class="text-truncate" title="${user.HoTen}">${user.HoTen}</span></td>
                <td><span class="text-truncate" title="${user.Email}">${user.Email}</span></td>
                <td><span class="text-truncate">${user.SoDienThoai || '-'}</span></td>
                <td>
                    <span class="badge ${this.getRoleBadgeClass(user.VaiTro)}">
                        ${this.getRoleDisplayName(user.VaiTro)}
                    </span>
                </td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(user.TrangThai)}">
                        ${this.getStatusDisplayName(user.TrangThai)}
                    </span>
                </td>
                <td>
                    <span class="date-display" title="${new Date(user.NgayTao).toLocaleString('vi-VN')}">
                        ${new Date(user.NgayTao).toLocaleDateString('vi-VN')}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="usersManagement.viewUser(${user.MaNguoiDung})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="usersManagement.editUserStatus(${user.MaNguoiDung})" title="Thay đổi trạng thái">
                            <i class="fas fa-user-cog"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="usersManagement.deleteUser(${user.MaNguoiDung})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Bind checkbox events
        const checkboxes = tbody.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.handleUserSelection();
            });
        });

        // Add row hover effects
        const rows = tbody.querySelectorAll('tr[data-user-id]');
        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.transform = 'translateY(-2px)';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.transform = 'translateY(0)';
            });
        });
    }

    getRoleBadgeClass(role) {
        const classes = {
            'admin': 'badge-danger',
            'chunha': 'badge-warning',
            'nguoithue': 'badge-info'
        };
        return classes[role] || 'badge-secondary';
    }

    getRoleDisplayName(role) {
        const names = {
            'admin': 'Quản trị viên',
            'chunha': 'Chủ nhà',
            'nguoithue': 'Người thuê'
        };
        return names[role] || role;
    }

    getStatusBadgeClass(status) {
        const classes = {
            'hoatdong': 'badge-success',
            'khonghoatdong': 'badge-secondary',
            'bikhoa': 'badge-danger'
        };
        return classes[status] || 'badge-secondary';
    }

    getStatusDisplayName(status) {
        const names = {
            'hoatdong': 'Hoạt động',
            'khonghoatdong': 'Không hoạt động',
            'bikhoa': 'Bị khóa'
        };
        return names[status] || status;
    }

    updatePagination(data) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        // Handle the correct API response structure
        const paginationData = data.pagination || data;
        const { currentPage, totalPages, totalItems, itemsPerPage } = paginationData;
        
        // Calculate display values
        const total = totalItems || 0;
        const limit = itemsPerPage || this.pageSize;
        const page = currentPage || this.currentPage;
        const totalPagesCalc = totalPages || 0;
        
        const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
        const endItem = Math.min(page * limit, total);

        pagination.innerHTML = `
            <div class="pagination-info">
                Hiển thị ${startItem}-${endItem} trong tổng số ${total} người dùng
            </div>
            <div class="pagination-controls">
                <button class="btn btn-sm btn-secondary" ${page <= 1 ? 'disabled' : ''} 
                        onclick="usersManagement.goToPage(${page - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-info">Trang ${page} / ${totalPagesCalc}</span>
                <button class="btn btn-sm btn-secondary" ${page >= totalPagesCalc ? 'disabled' : ''} 
                        onclick="usersManagement.goToPage(${page + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadUsers();
    }

    handleUserSelection() {
        const checkboxes = document.querySelectorAll('.user-checkbox:checked');
        this.selectedUsers = Array.from(checkboxes).map(cb => cb.value);
        this.updateBulkActionState();
    }

    handleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.handleUserSelection();
    }

    updateBulkActionState() {
        const bulkActions = document.getElementById('bulkActions');
        const bulkActionBtn = document.getElementById('bulkActionBtn');
        
        if (this.selectedUsers.length > 0) {
            if (bulkActions) bulkActions.style.display = 'flex';
            if (bulkActionBtn) bulkActionBtn.disabled = false;
        } else {
            if (bulkActions) bulkActions.style.display = 'none';
            if (bulkActionBtn) bulkActionBtn.disabled = true;
        }
    }

    async handleBulkAction() {
        const actionSelect = document.getElementById('bulkActionSelect');
        const action = actionSelect.value;

        if (!action || this.selectedUsers.length === 0) {
            this.showError('Vui lòng chọn hành động và ít nhất một người dùng');
            return;
        }

        if (confirm(`Bạn có chắc chắn muốn ${action} ${this.selectedUsers.length} người dùng đã chọn?`)) {
            try {
                const response = await fetch('/api/users/bulk/status', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userIds: this.selectedUsers,
                        status: action
                    })
                });

                const result = await response.json();

                if (result.success) {
                    this.showSuccess(result.data.message);
                    this.selectedUsers = [];
                    this.updateBulkActionState();
                    this.loadUsers();
                    this.loadStats();
                } else {
                    this.showError(result.message || 'Lỗi khi thực hiện hành động');
                }
            } catch (error) {
                console.error('Error performing bulk action:', error);
                this.showError('Lỗi kết nối khi thực hiện hành động');
            }
        }
    }

    openAddUserModal() {
        this.currentUserId = null;
        const modalTitle = document.getElementById('modalTitle');
        
        if (modalTitle) modalTitle.textContent = 'Thêm người dùng mới';
        
        // Reset form to ensure all fields are enabled
        this.resetUserForm();
        
        // Make password required for new users
        const passwordField = document.getElementById('userPassword');
        if (passwordField) {
            passwordField.required = true;
            passwordField.placeholder = 'Nhập mật khẩu';
        }
        
        this.showModal('userModal');
    }

    async viewUser(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`);
            const result = await response.json();

            if (result.success) {
                this.currentUserId = userId;
                const user = result.data;
                const modalTitle = document.getElementById('modalTitle');
                const saveBtn = document.getElementById('saveUserBtn');
                
                if (modalTitle) modalTitle.textContent = 'Thông tin người dùng';
                if (saveBtn) saveBtn.style.display = 'none'; // Hide save button
                
                // Fill form with user data and make fields read-only
                const fields = {
                    'userCCCD': user.CCCD || '',
                    'userName': user.TenDangNhap || '',
                    'userFullName': user.HoTen || '',
                    'userEmail': user.Email || '',
                    'userPhone': user.SoDienThoai || '',
                    'userRole': user.VaiTro || '',
                    'userStatus': user.TrangThai || ''
                };

                Object.entries(fields).forEach(([fieldId, value]) => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.value = value;
                        field.readOnly = true;
                        field.disabled = true;
                    }
                });
                
                // Hide password field completely
                const passwordField = document.getElementById('userPassword');
                const passwordGroup = passwordField?.closest('.form-group');
                if (passwordGroup) {
                    passwordGroup.style.display = 'none';
                }
                
                this.showModal('userModal');
            } else {
                this.showError(result.message || 'Lỗi khi tải thông tin người dùng');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            this.showError('Lỗi kết nối khi tải thông tin người dùng');
        }
    }

    async editUserStatus(userId) {
        try {
            // Get current user data first
            const response = await fetch(`/api/users/${userId}`);
            const result = await response.json();

            if (result.success) {
                const user = result.data;
                this.currentUserId = userId;
                
                // Fill status modal with user data
                document.getElementById('statusUserName').value = user.HoTen;
                document.getElementById('currentStatus').value = this.getStatusDisplayName(user.TrangThai);
                
                // Set up new status options (exclude current status)
                const newStatusSelect = document.getElementById('newStatus');
                const statusOptions = [
                    { value: 'hoatdong', text: 'Hoạt động' },
                    { value: 'khonghoatdong', text: 'Không hoạt động' },
                    { value: 'bikhoa', text: 'Bị khóa' }
                ];
                
                // Clear and populate select options
                newStatusSelect.innerHTML = '<option value="">-- Chọn trạng thái --</option>';
                statusOptions.forEach(option => {
                    if (option.value !== user.TrangThai) {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.text;
                        newStatusSelect.appendChild(optionElement);
                    }
                });
                
                // Clear reason field
                document.getElementById('statusReason').value = '';
                
                this.showModal('statusModal');
            } else {
                this.showError(result.message || 'Lỗi khi tải thông tin người dùng');
            }
        } catch (error) {
            console.error('Error loading user for status change:', error);
            this.showError('Lỗi kết nối khi tải thông tin người dùng');
        }
    }

    async saveUserStatus() {
        const newStatus = document.getElementById('newStatus').value;
        const reason = document.getElementById('statusReason').value.trim();
        
        if (!newStatus) {
            this.showError('Vui lòng chọn trạng thái mới');
            return;
        }
        
        try {
            const response = await fetch(`/api/users/${this.currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    TrangThai: newStatus
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Đã thay đổi trạng thái người dùng thành công');
                this.closeModal('statusModal');
                this.loadUsers();
                this.loadStats();
            } else {
                this.showError(result.message || 'Lỗi khi thay đổi trạng thái người dùng');
            }
        } catch (error) {
            console.error('Error saving user status:', error);
            this.showError('Lỗi kết nối khi thay đổi trạng thái người dùng');
        }
    }

    async saveUser() {
        const form = document.getElementById('userForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const userData = {
            CCCD: document.getElementById('userCCCD').value.trim(),
            TenDangNhap: document.getElementById('userName').value.trim(),
            HoTen: document.getElementById('userFullName').value.trim(),
            Email: document.getElementById('userEmail').value.trim(),
            SoDienThoai: document.getElementById('userPhone').value.trim(),
            VaiTro: document.getElementById('userRole').value,
            TrangThai: document.getElementById('userStatus').value
        };

        const password = document.getElementById('userPassword').value.trim();
        if (password) {
            userData.MatKhau = password;
        }

        try {
            const url = this.currentUserId ? `/api/users/${this.currentUserId}` : '/api/users';
            const method = this.currentUserId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(result.message || 'Lưu thông tin người dùng thành công');
                this.closeModal('userModal');
                this.loadUsers();
                this.loadStats();
            } else {
                this.showError(result.message || 'Lỗi khi lưu thông tin người dùng');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            this.showError('Lỗi kết nối khi lưu thông tin người dùng');
        }
    }

    deleteUser(userId) {
        this.currentUserId = userId;
        this.showModal('deleteModal');
    }

    async confirmDelete() {
        if (!this.currentUserId) return;

        try {
            const response = await fetch(`/api/users/${this.currentUserId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(result.message || 'Xóa người dùng thành công');
                this.closeModal('deleteModal');
                this.loadUsers();
                this.loadStats();
            } else {
                this.showError(result.message || 'Lỗi khi xóa người dùng');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showError('Lỗi kết nối khi xóa người dùng');
        }
    }

    async exportToExcel() {
        try {
            const params = new URLSearchParams({
                search: this.currentSearch,
                role: this.currentRoleFilter,
                status: this.currentStatusFilter,
                export: 'excel'
            });

            const response = await fetch(`/api/users/export?${params}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `users_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                this.showSuccess('Xuất dữ liệu thành công');
            } else {
                this.showError('Lỗi khi xuất dữ liệu');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Lỗi kết nối khi xuất dữ liệu');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form if it's the user modal
            if (modalId === 'userModal') {
                this.resetUserForm();
            }
        }
    }

    resetUserForm() {
        const form = document.getElementById('userForm');
        if (form) {
            form.reset();
        }
        
        // Reset all form fields to enabled state
        const fieldIds = ['userCCCD', 'userName', 'userFullName', 'userEmail', 'userPhone', 'userRole', 'userStatus'];
        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.readOnly = false;
                field.disabled = false;
            }
        });
        
        // Show password field
        const passwordField = document.getElementById('userPassword');
        const passwordGroup = passwordField?.closest('.form-group');
        if (passwordGroup) {
            passwordGroup.style.display = 'block';
        }
        
        // Show save button
        const saveBtn = document.getElementById('saveUserBtn');
        if (saveBtn) {
            saveBtn.style.display = 'inline-block';
        }
    }

    showLoading() {
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr class="loading-row">
                    <td colspan="10">
                        <div class="loading-state">
                            <div class="loading-spinner">
                                <div class="spinner-ring"></div>
                                <div class="spinner-ring"></div>
                                <div class="spinner-ring"></div>
                            </div>
                            <div class="loading-text">Đang tải dữ liệu...</div>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    hideLoading() {
        // Loading will be hidden when data is rendered
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('.notification-icon');
        const messageEl = notification.querySelector('.notification-message');
        
        if (notification && icon && messageEl) {
            // Set icon based on type
            icon.className = `notification-icon fas ${type === 'success' ? 'fa-check-circle' : 
                                                   type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`;
            
            // Set message
            messageEl.textContent = message;
            
            // Set notification class
            notification.className = `notification ${type}`;
            
            // Show notification
            notification.style.display = 'block';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
    }

    updateTableSubtitle() {
        const subtitle = document.getElementById('tableSubtitle');
        if (!subtitle) return;

        let text = 'Quản lý thông tin người dùng';
        const filters = [];

        if (this.currentSearch) {
            filters.push(`tìm kiếm: "${this.currentSearch}"`);
        }
        if (this.currentRoleFilter) {
            const roleNames = {
                'admin': 'Quản trị viên',
                'chunha': 'Chủ nhà',
                'nguoithue': 'Người thuê'
            };
            filters.push(`vai trò: ${roleNames[this.currentRoleFilter]}`);
        }
        if (this.currentStatusFilter) {
            const statusNames = {
                'hoatdong': 'Hoạt động',
                'khonghoatdong': 'Không hoạt động',
                'bikhoa': 'Bị khóa'
            };
            filters.push(`trạng thái: ${statusNames[this.currentStatusFilter]}`);
        }

        if (filters.length > 0) {
            text += ` (${filters.join(', ')})`;
        }

        subtitle.textContent = text;
    }

    async loadUserStats() {
        try {
            // SỬ DỤNG Dashboard API + User API
            const [dashboardResponse, userResponse] = await Promise.all([
                fetch('/api/dashboard/stats'),
                fetch('/api/users/stats') 
            ]);
            
            const dashboardResult = await dashboardResponse.json();
            const userResult = await userResponse.json();
            
            if (dashboardResult.success && userResult.success) {
                const dashStats = dashboardResult.data;
                const userStats = userResult.data;
                
                // Update stats cards với data-stat attributes
                document.querySelector('[data-stat="totalUsers"]').textContent = dashStats.totalUsers;
                document.querySelector('[data-stat="owners"]').textContent = userStats.ownersCount;
                document.querySelector('[data-stat="tenants"]').textContent = userStats.tenantsCount;
                document.querySelector('[data-stat="newUsers"]').textContent = dashStats.newUsersThisMonth;
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.usersManagement = new UsersManagement();
}); 