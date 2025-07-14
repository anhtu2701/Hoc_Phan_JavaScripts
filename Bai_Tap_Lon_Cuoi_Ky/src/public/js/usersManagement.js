class UsersManagement {
    constructor() {
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

        this.bindModalEvents();
    }

    bindModalEvents() {
        // User modal events
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
            owners: stats.adminsCount || 0, 
        tenants: stats.usersCount || 0,       
        newUsers: stats.activeUsers || 0 
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
            const response = await fetch('/api/users');
            const result = await response.json();

            if (result.success) {
                this.renderUsers(result.data.users);
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
                            <p>Không có người dùng nào</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr data-user-id="${user.userID}">
                <td>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" class="custom-checkbox user-checkbox" value="${user.userID}" id="user-${user.userID}">
                        <label for="user-${user.userID}" class="checkbox-label"></label>
                    </div>
                </td>
                <td><span class="text-truncate" title="${user.nationalID}">${user.nationalID}</span></td>
                <td><span class="text-truncate" title="${user.username}">${user.username}</span></td>
                <td><span class="text-truncate" title="${user.fullName}">${user.fullName}</span></td>
                <td><span class="text-truncate" title="${user.email}">${user.email}</span></td>
                <td><span class="text-truncate">${user.phoneNumber || '-'}</span></td>
                <td>
                    <span class="badge ${this.getRoleBadgeClass(user.role)}">
                        ${this.getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(user.status)}">
                        ${this.getStatusDisplayName(user.status)}
                    </span>
                </td>
                <td>
                    <span class="date-display" title="${new Date(user.createdAt).toLocaleString('vi-VN')}">
                        ${new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="usersManagement.viewUser(${user.userID})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="usersManagement.deleteUser(${user.userID})" title="Xóa">
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
    }

    getRoleBadgeClass(role) {
        const classes = {
            'admin': 'badge-danger',
            'user': 'badge-info'
        };
        return classes[role] || 'badge-secondary';
    }

    getRoleDisplayName(role) {
        const names = {
            'admin': 'Quản trị viên',
            'user': 'Người dùng'
        };
        return names[role] || role;
    }

    getStatusBadgeClass(status) {
        const classes = {
            'active': 'badge-success',
            'inactive': 'badge-secondary'
        };
        return classes[status] || 'badge-secondary';
    }

    getStatusDisplayName(status) {
        const names = {
            'active': 'Hoạt động',
            'inactive': 'Không hoạt động'
        };
        return names[status] || status;
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
        const bulkAction = document.getElementById('bulkAction');
        const applyBulkAction = document.getElementById('applyBulkAction');
        
        if (this.selectedUsers.length > 0) {
            if (bulkAction) bulkAction.disabled = false;
            if (applyBulkAction) applyBulkAction.disabled = false;
        } else {
            if (bulkAction) bulkAction.disabled = true;
            if (applyBulkAction) applyBulkAction.disabled = true;
        }
    }

    async handleBulkAction() {
        const actionSelect = document.getElementById('bulkAction');
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
        
        this.resetUserForm();
        
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
                if (saveBtn) saveBtn.style.display = 'none';
                
                const fields = {
                    'userCCCD': user.nationalID || '',
                    'userName': user.username || '',
                    'userFullName': user.fullName || '',
                    'userEmail': user.email || '',
                    'userPhone': user.phoneNumber || '',
                    'userRole': user.role || '',
                    'userStatus': user.status || ''
                };

                Object.entries(fields).forEach(([fieldId, value]) => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.value = value;
                        field.readOnly = true;
                        field.disabled = true;
                    }
                });
                
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
            const response = await fetch(`/api/users/${userId}`);
            const result = await response.json();

            if (result.success) {
                const user = result.data;
                this.currentUserId = userId;
                
                document.getElementById('statusUserName').value = user.fullName;
                document.getElementById('currentStatus').value = this.getStatusDisplayName(user.status);
                
                const newStatusSelect = document.getElementById('newStatus');
                const statusOptions = [
                    { value: 'active', text: 'Hoạt động' },
                    { value: 'inactive', text: 'Không hoạt động' }
                ];
                
                newStatusSelect.innerHTML = '<option value="">-- Chọn trạng thái --</option>';
                statusOptions.forEach(option => {
                    if (option.value !== user.status) {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.text;
                        newStatusSelect.appendChild(optionElement);
                    }
                });
                
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
                    status: newStatus 
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
            nationalID: document.getElementById('userCCCD').value.trim(),
            username: document.getElementById('userName').value.trim(),
            fullName: document.getElementById('userFullName').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            phoneNumber: document.getElementById('userPhone').value.trim(),
            role: document.getElementById('userRole').value,
            status: document.getElementById('userStatus').value
        };

        const password = document.getElementById('userPassword').value.trim();
        if (password) {
            userData.password = password;
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
        
        const fieldIds = ['userCCCD', 'userName', 'userFullName', 'userEmail', 'userPhone', 'userRole', 'userStatus'];
        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.readOnly = false;
                field.disabled = false;
            }
        });
        
        const passwordField = document.getElementById('userPassword');
        const passwordGroup = passwordField?.closest('.form-group');
        if (passwordGroup) {
            passwordGroup.style.display = 'block';
        }
        
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
            icon.className = `notification-icon fas ${type === 'success' ? 'fa-check-circle' : 
                                                   type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`;
            
            messageEl.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.usersManagement = new UsersManagement();
});