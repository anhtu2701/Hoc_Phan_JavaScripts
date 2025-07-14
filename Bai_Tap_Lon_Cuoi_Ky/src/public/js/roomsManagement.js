class RoomsManagement {
    constructor() {
        this.currentViewMode = 'grid';
        this.editingRoomId = null;
        this.uploadedImageFile = null;
        this.tempImageUrl = null;
        this.tempFilename = null;
        this.currentRoomImageUrl = null;
        this.isLoading = false;
        this.isUploading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStats();
        this.loadRooms();
        this.setupImageUpload();
    }

    bindEvents() {
        // Modal controls
        document.getElementById('addRoomBtn').addEventListener('click', () => this.openAddRoomModal());
        document.getElementById('closeRoomModal').addEventListener('click', () => this.closeRoomModal());
        document.getElementById('cancelRoomBtn').addEventListener('click', () => this.closeRoomModal());
        document.getElementById('saveRoomBtn').addEventListener('click', () => this.saveRoom());

        // View toggle
        document.getElementById('gridViewBtn').addEventListener('click', () => this.setViewMode('grid'));
        document.getElementById('listViewBtn').addEventListener('click', () => this.setViewMode('list'));

        // Refresh button
        document.getElementById('refreshRoomsBtn').addEventListener('click', () => this.loadRooms());

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    setupImageUpload() {
        // Tạo input file ẩn cho upload ảnh
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.id = 'roomImageInput';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Tránh upload trùng lặp
        if (this.isUploading) {
            this.showNotification('Đang tải ảnh, vui lòng chờ...', 'warning');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('File ảnh quá lớn! Vui lòng chọn file dưới 5MB.', 'error');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Vui lòng chọn file ảnh hợp lệ!', 'error');
            return;
        }
        // upload ảnh tạm thời
        try {
            this.isUploading = true;
            this.showLoading('Đang tải ảnh lên...');
            
            const formData = new FormData();
            formData.append('image', file);
    
            const response = await fetch('/api/upload/room-image', {
                method: 'POST',
                body: formData
            });
    
            const result = await response.json();
            this.hideLoading();
    
            if (result.success) {
                this.tempFilename = result.data.tempFilename;
                this.tempImageUrl = result.data.imageUrl;
                this.displayUploadedImage(this.tempImageUrl);
                this.showNotification(`Đã tải ảnh thành công!`, 'success');
            } else {
                this.showNotification('Lỗi tải ảnh: ' + result.message, 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Lỗi tải ảnh:', error);
            this.showNotification('Lỗi kết nối khi tải ảnh!', 'error');
        } finally {
            this.isUploading = false; 
        }
    }

    displayUploadedImage(imageUrl) {
        let previewContainer = document.getElementById('imagePreviewContainer');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'imagePreviewContainer';
            previewContainer.className = 'image-preview-container';
            
            const form = document.getElementById('roomForm');
            const descriptionGroup = form.querySelector('#roomDescription').parentElement;
            form.insertBefore(previewContainer, descriptionGroup);
        }

        previewContainer.innerHTML = `
            <label>Ảnh phòng</label>
            <div class="image-preview">
                <img src="${imageUrl}" alt="Room preview" class="preview-image">
                <div class="image-actions">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="roomsManager.changeImage()">
                        <i class="fas fa-edit"></i> Đổi ảnh
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="roomsManager.removeImage()">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `;
    }

    changeImage() {
        document.getElementById('roomImageInput').click();
    }

    async removeImage() {
        // Xóa ảnh tạm thời trên sever nếu có
        if (this.tempFilename) {
            try {
                await fetch(`/api/upload/temp-image/${this.tempFilename}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error('Lỗi xóa ảnh tạm thời:', error);
            }
        }

        const previewContainer = document.getElementById('imagePreviewContainer');
        if (previewContainer) {
            previewContainer.remove();
        }
        this.tempImageUrl = null;
        this.tempFilename = null;
    }

    async loadStats() {
        try {
            const response = await fetch('/api/dashboard/stats');
            const result = await response.json();
    
            if (result.success) {
                const stats = result.data;
                
                document.getElementById('totalRoomsCount').textContent = stats.totalRooms || 0;
                document.getElementById('availableRoomsCount').textContent = stats.availableRooms || 0;
                document.getElementById('occupiedRoomsCount').textContent = stats.occupiedRooms || 0;
                
                this.animateCountUp(document.getElementById('totalRoomsCount'), stats.totalRooms);
                this.animateCountUp(document.getElementById('availableRoomsCount'), stats.availableRooms);
                this.animateCountUp(document.getElementById('occupiedRoomsCount'), stats.occupiedRooms);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    animateCountUp(element, target) {
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

    // ✅ ĐƠN GIẢN: Load rooms (không pagination/filter)
    async loadRooms() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading('Đang tải danh sách phòng...');

        try {
            const response = await fetch('/api/rooms');
            const result = await response.json();

            if (result.success) {
                this.renderRooms(result.data.rooms);
            } else {
                this.showNotification('Lỗi tải danh sách phòng!', 'error');
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.showNotification('Lỗi kết nối!', 'error');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderRooms(rooms) {
        if (this.currentViewMode === 'grid') {
            this.renderGridView(rooms);
        } else {
            this.renderTableView(rooms);
        }
    }

    // Render grid 
    renderGridView(rooms) {
        const container = document.querySelector('.rooms-grid');
        
        if (rooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-home"></i>
                    <h3>Không có phòng nào</h3>
                    <p>Chưa có phòng nào được tạo.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = rooms.map(room => `
            <div class="room-card" data-room-id="${room.roomID}">
                <div class="room-image">
                    <img src="${room.imageURL || '/img/houses/default.jpg'}" 
                         alt="${room.title}" 
                         onerror="this.src='/img/houses/default.jpg'">
                </div>
                <div class="room-info">
                    <div class="room-id"><span>${room.roomID}</span></div>
                    <h4 class="room-title">${room.title}</h4>
                    <p class="room-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${room.address}
                    </p>
                    <div class="room-details">
                        <span class="room-price">${this.formatCurrency(room.price)}/tháng</span>
                        <span class="room-area">${room.area}m²</span>
                    </div>
                    <div class="room-status">
                        <span class="status-badge ${this.getStatusClass(room.status)}">
                            ${this.getStatusText(room.status)}
                        </span>
                    </div>
                </div>
                <div class="room-actions">
                    <button class="action-btn view" onclick="roomsManager.viewRoom('${room.roomID}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="roomsManager.editRoom('${room.roomID}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="roomsManager.deleteRoom('${room.roomID}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ✅ CẬP NHẬT: Render table với tên field database
    renderTableView(rooms) {
        const tbody = document.getElementById('roomsTableBody');
        
        if (rooms.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-home"></i>
                            <p>Không có phòng nào</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = rooms.map(room => `
            <tr data-room-id="${room.roomID}">
                <td>${room.roomID}</td>
                <td>${room.title}</td>
                <td>${room.address}</td>
                <td>${this.formatCurrency(room.price)}</td>
                <td>${room.area}m²</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(room.status)}">
                        ${this.getStatusText(room.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="roomsManager.viewRoom('${room.roomID}')" title="Xem">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="roomsManager.editRoom('${room.roomID}')" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="roomsManager.deleteRoom('${room.roomID}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setViewMode(mode) {
        this.currentViewMode = mode;
        
        // Update buttons
        document.getElementById('gridViewBtn').classList.toggle('active', mode === 'grid');
        document.getElementById('listViewBtn').classList.toggle('active', mode === 'list');
        
        // Show/hide sections
        document.getElementById('roomsGridSection').style.display = mode === 'grid' ? 'block' : 'none';
        document.getElementById('roomsTableSection').style.display = mode === 'list' ? 'block' : 'none';
        
        // Reload data for current view
        this.loadRooms();
    }

    async openAddRoomModal() {
        this.editingRoomId = null;
        this.currentRoomImageUrl = null; 
        this.tempImageUrl = null;
        document.getElementById('modalTitle').textContent = 'Thêm phòng mới';
        document.getElementById('roomForm').reset();
        this.removeImage();
        this.showModal('roomModal');
        this.addImageUploadButton();
    }

    addImageUploadButton() {
        const form = document.getElementById('roomForm');
        const descriptionGroup = form.querySelector('#roomDescription').parentElement;
        
        // Remove existing upload button
        const existingButton = document.getElementById('uploadImageButton');
        if (existingButton) {
            existingButton.remove();
        }

        const uploadButton = document.createElement('div');
        uploadButton.id = 'uploadImageButton';
        uploadButton.className = 'form-group';
        uploadButton.innerHTML = `
            <label>Ảnh phòng</label>
            <button type="button" class="btn btn-outline-secondary btn-upload" onclick="roomsManager.changeImage()">
                <i class="fas fa-camera"></i>
                Chọn ảnh
            </button>
            <small class="form-text text-muted">Chọn ảnh cho phòng (tối đa 5MB)</small>
        `;
        
        form.insertBefore(uploadButton, descriptionGroup);
    }

    async editRoom(roomId) {
        try {
            this.showLoading('Đang tải thông tin phòng...');
            
            const response = await fetch(`/api/rooms/${roomId}`);
            const result = await response.json();
            
            this.hideLoading();

            if (result.success) {
                const room = result.data;
                this.editingRoomId = roomId;
                this.currentRoomImageUrl = room.imageURL;
                
                document.getElementById('modalTitle').textContent = 'Chỉnh sửa phòng';
                document.getElementById('roomName').value = room.title;
                document.getElementById('roomAddress').value = room.address;
                document.getElementById('roomPrice').value = room.price;
                document.getElementById('roomArea').value = room.area;
                document.getElementById('roomDescription').value = room.description || '';
                document.getElementById('roomStatus').value = room.status;
                
                if (room.imageURL) {
                    this.tempImageUrl = room.imageURL; // Dùng ảnh hiện tại làm temp
                    this.displayUploadedImage(room.imageURL);
                } else {
                    this.addImageUploadButton();
                }

                this.showModal('roomModal');

            } else {
                this.showNotification('Lỗi tải thông tin phòng!', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error loading room:', error);
            this.showNotification('Lỗi kết nối!', 'error');
        }
    }

    async saveRoom() {
        try {
            const formData = this.getFormData();
            if (!formData) return;

            this.showLoading('Đang lưu thông tin...');

            const url = this.editingRoomId ? `/api/rooms/${this.editingRoomId}` : '/api/rooms';
            const method = this.editingRoomId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            this.hideLoading();

            if (result.success) {
                this.showNotification(`${this.editingRoomId ? 'Cập nhật' : 'Thêm'} phòng thành công!`, 'success');
                

                if (this.tempFilename && !this.editingRoomId) {
                    this.tempFilename = null;
                    this.tempImageUrl = null;
                }
                
                this.closeRoomModal();
                this.loadRooms();
                this.loadStats();
            } else {
                this.showNotification(result.message || 'Lỗi lưu thông tin!', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error saving room:', error);
            this.showNotification('Lỗi kết nối!', 'error');
        }
    }

    getFormData() {
        const roomData = {
            title: document.getElementById('roomName').value.trim(),
            address: document.getElementById('roomAddress').value.trim(),
            price: parseInt(document.getElementById('roomPrice').value),
            area: parseFloat(document.getElementById('roomArea').value),
            description: document.getElementById('roomDescription').value.trim(),
            status: document.getElementById('roomStatus').value,
        };

        // Thêm thông tin ảnh
        if (this.editingRoomId) {
            roomData.imageURL = this.tempImageUrl && this.tempImageUrl.startsWith('/uploads/temp/') 
                ? this.currentRoomImageUrl 
                : (this.tempImageUrl || this.currentRoomImageUrl || '');
            if (this.tempFilename) {
                roomData.tempFilename = this.tempFilename;
            }
        } else {
            if (this.tempFilename) {
                roomData.tempFilename = this.tempFilename;
            }
        }

        // Validation
        if (!roomData.title || !roomData.address || !roomData.price || !roomData.area) {
            this.showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
            return null;
        }

        return roomData;
    }

    async deleteRoom(roomId) {
        if (!confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
            return;
        }

        try {
            this.showLoading('Đang xóa phòng...');

            const response = await fetch(`/api/rooms/${roomId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            this.hideLoading();

            if (result.success) {
                this.showNotification('Xóa phòng thành công!', 'success');
                this.loadRooms();
                this.loadStats();
            } else {
                this.showNotification(result.message || 'Lỗi xóa phòng!', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error deleting room:', error);
            this.showNotification('Lỗi kết nối!', 'error');
        }
    }

    async viewRoom(roomId) {
        try {
            this.showLoading('Đang tải chi tiết...');
            
            const response = await fetch(`/api/rooms/${roomId}`);
            const result = await response.json();
            
            this.hideLoading();

            if (result.success) {
                this.showRoomDetails(result.data);
            } else {
                this.showNotification('Lỗi tải thông tin phòng!', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error loading room details:', error);
            this.showNotification('Lỗi kết nối!', 'error');
        }
    }

    showRoomDetails(room) {
        const content = document.getElementById('roomDetailsContent');
        content.innerHTML = `
            <div class="room-details-grid">
                <div class="room-image-section">
                    <img src="${room.imageURL || '/img/houses/default.jpg'}" 
                         alt="${room.title}" 
                         class="room-detail-image"
                         onerror="this.src='/img/houses/default.jpg'">
                </div>
                <div class="room-info-section">
                    <h4>${room.title}</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Mã phòng:</label>
                            <span>${room.roomID}</span>
                        </div>
                        <div class="detail-item">
                            <label>Địa chỉ:</label>
                            <span>${room.address}</span>
                        </div>
                        <div class="detail-item">
                            <label>Giá thuê:</label>
                            <span>${this.formatCurrency(room.price)}/tháng</span>
                        </div>
                        <div class="detail-item">
                            <label>Diện tích:</label>
                            <span>${room.area}m²</span>
                        </div>
                        <div class="detail-item">
                            <label>Trạng thái:</label>
                            <span class="status-badge ${this.getStatusClass(room.status)}">
                                ${this.getStatusText(room.status)}
                            </span>
                        </div>
                        ${room.description ? `
                        <div class="detail-item full-width">
                            <label>Mô tả:</label>
                            <span>${room.description}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        this.showModal('roomDetailsModal');
    }

    // Utility methods
    getStatusClass(status) {
        const statusMap = {
            'available': 'status-available',
            'occupied': 'status-occupied', 
            'maintenance': 'status-maintenance'
        };
        return statusMap[status] || 'status-unknown';
    }

    getStatusText(status) {
        const statusMap = {
            'available': 'Còn trống',
            'occupied': 'Đã thuê',
            'maintenance': 'Bảo trì'
        };
        return statusMap[status] || 'Không xác định';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    async closeRoomModal() {
        // Xóa ảnh tạm thời trên sever nếu có
        if (this.tempFilename) {
            try {
                await fetch(`/api/upload/temp-image/${this.tempFilename}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error('Lỗi xóa ảnh tạm thời:', error);
            }
        }

        document.getElementById('roomModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.removeImage();
        this.editingRoomId = null;
        this.currentRoomImageUrl = null; 
        this.tempImageUrl = null;
        this.tempFilename = null;
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    showLoading(message = 'Đang tải...') {
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.roomsManager = new RoomsManagement();
});