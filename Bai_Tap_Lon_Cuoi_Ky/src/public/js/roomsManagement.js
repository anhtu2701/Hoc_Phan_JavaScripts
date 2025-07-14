// Rooms Management JavaScript
class RoomsManagement {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 0;
        this.currentViewMode = 'grid';
        this.currentFilter = '';
        this.searchQuery = '';
        this.editingRoomId = null;
        this.uploadedImageFile = null;
        this.tempImageUrl = null;
        this.autoRefreshInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStats();
        this.loadRooms();
        this.setupImageUpload();
        this.startAutoRefresh();
    }

    startAutoRefresh() {
        // Refresh every 3 minutes for management pages
        this.autoRefreshInterval = setInterval(() => {
            this.loadStats();
            this.updateLastRefreshTime();
        }, 3 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    updateLastRefreshTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN');
        
        // Hiển thị trong header
        let refreshIndicator = document.getElementById('refreshIndicator');
        if (!refreshIndicator) {
            refreshIndicator = document.createElement('small');
            refreshIndicator.id = 'refreshIndicator';
            refreshIndicator.className = 'refresh-indicator';
            document.querySelector('.dashboard-header p').appendChild(refreshIndicator);
        }
        refreshIndicator.textContent = ` • Cập nhật lúc ${timeStr}`;
    }

    // Cleanup khi rời trang
    destroy() {
        this.stopAutoRefresh();
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

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.debounceSearch();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.loadRooms();
        });

        // Refresh button
        document.getElementById('refreshRoomsBtn').addEventListener('click', () => this.loadRooms());

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

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

        try {
            this.showLoading('Đang upload ảnh...');
            
            const formData = new FormData();
            formData.append('roomImage', file);

            const response = await fetch('/api/rooms/temp-upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            this.hideLoading();

            if (result.success) {
                this.tempImageUrl = result.tempImageUrl;
                this.uploadedImageFile = file;
                this.displayUploadedImage(result.tempImageUrl);
                this.showNotification('Upload ảnh thành công!', 'success');
            } else {
                this.showNotification(result.message || 'Lỗi upload ảnh!', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Upload error:', error);
            this.showNotification('Lỗi kết nối khi upload ảnh!', 'error');
        }
    }

    displayUploadedImage(imageUrl) {
        // Tìm hoặc tạo preview container
        let previewContainer = document.getElementById('imagePreviewContainer');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'imagePreviewContainer';
            previewContainer.className = 'image-preview-container';
            
            // Thêm vào form
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

    removeImage() {
        const previewContainer = document.getElementById('imagePreviewContainer');
        if (previewContainer) {
            previewContainer.remove();
        }
        this.tempImageUrl = null;
        this.uploadedImageFile = null;
    }

    async loadStats() {
        try {
            // ✅ SỬ DỤNG DASHBOARD API thay vì /api/rooms/stats
            const response = await fetch('/api/dashboard/stats');
            const result = await response.json();
    
            if (result.success) {
                const stats = result.data;
                
                // Update existing stats cards
                document.getElementById('totalRoomsCount').textContent = stats.totalRooms || 0;
                document.getElementById('availableRoomsCount').textContent = stats.availableRooms || 0;
                document.getElementById('occupiedRoomsCount').textContent = stats.occupiedRooms || 0;
                document.getElementById('monthlyRevenue').textContent = this.formatCurrency(stats.monthlyRevenue || 0);
                
                // ✅ THÊM ANIMATION từ dashboard
                this.animateCountUp(document.getElementById('totalRoomsCount'), stats.totalRooms);
                this.animateCountUp(document.getElementById('availableRoomsCount'), stats.availableRooms);
                this.animateCountUp(document.getElementById('occupiedRoomsCount'), stats.occupiedRooms);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    // ✅ THÊM Animation function từ dashboard
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

    async loadRooms() {
        try {
            this.showLoading('Đang tải danh sách phòng...');

            const params = new URLSearchParams({
                limit: this.pageSize,
                offset: (this.currentPage - 1) * this.pageSize,
                sort_by: 'MaPhong',
                sort_order: 'ASC'
            });

            if (this.currentFilter) {
                params.append('status', this.currentFilter);
            }

            if (this.searchQuery) {
                params.append('search', this.searchQuery);
            }

            const response = await fetch(`/api/rooms?${params}`);
            const result = await response.json();

            this.hideLoading();

            if (result.success) {
                this.renderRooms(result.data.rooms);
                this.totalPages = Math.ceil(result.data.total / this.pageSize);
                this.renderPagination();
            } else {
                this.showNotification('Lỗi tải danh sách phòng!', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error loading rooms:', error);
            this.showNotification('Lỗi kết nối!', 'error');
        }
    }

    renderRooms(rooms) {
        if (this.currentViewMode === 'grid') {
            this.renderGridView(rooms);
        } else {
            this.renderTableView(rooms);
        }
    }

    renderGridView(rooms) {
        const container = document.querySelector('.rooms-grid');
        
        if (rooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-home"></i>
                    <h3>Không có phòng nào</h3>
                    <p>Chưa có phòng nào được tạo hoặc không tìm thấy phòng phù hợp.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = rooms.map(room => `
            <div class="room-card" data-room-id="${room.MaPhong}">
                <div class="room-image">
                    <img src="${room.URLAnhPhong || './assets/img/houses/default.jpg'}" 
                         alt="${room.TieuDe}" 
                         onerror="this.src='./assets/img/houses/default.jpg'">
                </div>
                <div class="room-info">
                    <h4 class="room-title">${room.TieuDe}</h4>
                    <p class="room-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${room.DiaChi}
                    </p>
                    <div class="room-details">
                        <span class="room-price">${this.formatCurrency(room.GiaThue)}/tháng</span>
                        <span class="room-area">${room.DienTich}m²</span>
                    </div>
                </div>
                <div class="room-actions">
                    <button class="action-btn view" onclick="roomsManager.viewRoom('${room.MaPhong}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="roomsManager.editRoom('${room.MaPhong}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn upload" onclick="roomsManager.uploadRoomImage('${room.MaPhong}')" title="Đổi ảnh">
                        <i class="fas fa-camera"></i>
                    </button>
                    <button class="action-btn delete" onclick="roomsManager.deleteRoom('${room.MaPhong}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

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
            <tr data-room-id="${room.MaPhong}">
                <td>${room.MaPhong}</td>
                <td>${room.TieuDe}</td>
                <td>${room.DiaChi}</td>
                <td>${this.formatCurrency(room.GiaThue)}</td>
                <td>${room.DienTich}m²</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(room.TrangThai)}">
                        ${this.getStatusText(room.TrangThai)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="roomsManager.viewRoom('${room.MaPhong}')" title="Xem">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="roomsManager.editRoom('${room.MaPhong}')" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="roomsManager.uploadRoomImage('${room.MaPhong}')" title="Ảnh">
                            <i class="fas fa-camera"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="roomsManager.deleteRoom('${room.MaPhong}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPagination() {
        const container = document.getElementById('pagination');
        if (this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-buttons">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="roomsManager.goToPage(${this.currentPage - 1})">‹</button>`;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="roomsManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="roomsManager.goToPage(${i})">${i}</button>`;
        }

        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-btn" onclick="roomsManager.goToPage(${this.totalPages})">${this.totalPages}</button>`;
        }

        // Next button
        if (this.currentPage < this.totalPages) {
            paginationHTML += `<button class="page-btn" onclick="roomsManager.goToPage(${this.currentPage + 1})">›</button>`;
        }

        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadRooms();
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
        document.getElementById('modalTitle').textContent = 'Thêm phòng mới';
        document.getElementById('roomForm').reset();
        this.removeImage();
        
        // Load owners for admin
        await this.loadOwners();
        
        this.showModal('roomModal');
        
        // Thêm button upload ảnh vào form
        this.addImageUploadButton();
    }

    async loadOwners() {
        try {
            const response = await fetch('/api/users');
            const result = await response.json();
            
            if (result.success) {
                const ownerSelect = document.getElementById('roomOwner');
                ownerSelect.innerHTML = '<option value="">Chọn chủ nhà...</option>';
                
                result.data.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.MaNguoiDung;
                    option.textContent = `${user.HoTen} (${user.VaiTro}) - ${user.Email}`;
                    ownerSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading owners:', error);
        }
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
                
                document.getElementById('modalTitle').textContent = 'Chỉnh sửa phòng';
                document.getElementById('roomName').value = room.TieuDe;
                document.getElementById('roomAddress').value = room.DiaChi;
                document.getElementById('roomPrice').value = room.GiaThue;
                document.getElementById('roomArea').value = room.DienTich;
                document.getElementById('roomDescription').value = room.MoTa || '';
                document.getElementById('roomStatus').value = this.mapStatusToValue(room.TrangThai);
                
                // Load owners and set current owner
                await this.loadOwners();
                document.getElementById('roomOwner').value = room.MaChuNha;
                
                this.addImageUploadButton();
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
        const form = document.getElementById('roomForm');
        const formData = new FormData(form);
        
        const roomData = {
            TieuDe: document.getElementById('roomName').value.trim(),
            DiaChi: document.getElementById('roomAddress').value.trim(),
            GiaThue: parseInt(document.getElementById('roomPrice').value),
            DienTich: parseFloat(document.getElementById('roomArea').value),
            MoTa: document.getElementById('roomDescription').value.trim(),
            TrangThai: this.mapValueToStatus(document.getElementById('roomStatus').value),
            MaChuNha: document.getElementById('roomOwner').value
        };

        // Add optional fields
        const electricPrice = document.getElementById('electricPrice')?.value;
        const waterPrice = document.getElementById('waterPrice')?.value;
        const internetPrice = document.getElementById('internetPrice')?.value;
        const parkingPrice = document.getElementById('parkingPrice')?.value;

        if (electricPrice) roomData.GiaDien = parseInt(electricPrice);
        if (waterPrice) roomData.GiaNuoc = parseInt(waterPrice);
        if (internetPrice) roomData.GiaInternet = parseInt(internetPrice);
        if (parkingPrice) roomData.GiaGuiXe = parseInt(parkingPrice);

        // Add temp image URL if uploaded
        if (this.tempImageUrl) {
            roomData.tempImageUrl = this.tempImageUrl;
        }

        // Validation
        if (!roomData.TieuDe || !roomData.DiaChi || !roomData.GiaThue || !roomData.DienTich || !roomData.MaChuNha) {
            this.showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
            return null;
        }

        return roomData;
    }

    async uploadRoomImage(roomId) {
        this.editingRoomId = roomId;
        document.getElementById('roomImageInput').click();
        
        // Override the upload handler for direct room update
        const fileInput = document.getElementById('roomImageInput');
        const originalHandler = fileInput.onchange;
        
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                this.showLoading('Đang upload ảnh...');
                
                const formData = new FormData();
                formData.append('roomImage', file);

                const response = await fetch(`/api/rooms/${roomId}/upload`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                this.hideLoading();

                if (result.success) {
                    this.showNotification('Cập nhật ảnh thành công!', 'success');
                    this.loadRooms();
                } else {
                    this.showNotification(result.message || 'Lỗi upload ảnh!', 'error');
                }
            } catch (error) {
                this.hideLoading();
                console.error('Upload error:', error);
                this.showNotification('Lỗi kết nối!', 'error');
            }
            
            // Restore original handler
            fileInput.onchange = originalHandler;
        };
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
                    <img src="${room.URLAnhPhong || './assets/img/houses/default.jpg'}" 
                         alt="${room.TieuDe}" 
                         class="room-detail-image"
                         onerror="this.src='./assets/img/houses/default.jpg'">
                </div>
                <div class="room-info-section">
                    <h4>${room.TieuDe}</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Mã phòng:</label>
                            <span>${room.MaPhong}</span>
                        </div>
                        <div class="detail-item">
                            <label>Địa chỉ:</label>
                            <span>${room.DiaChi}</span>
                        </div>
                        <div class="detail-item">
                            <label>Giá thuê:</label>
                            <span>${this.formatCurrency(room.GiaThue)}/tháng</span>
                        </div>
                        <div class="detail-item">
                            <label>Diện tích:</label>
                            <span>${room.DienTich}m²</span>
                        </div>
                        <div class="detail-item">
                            <label>Trạng thái:</label>
                            <span class="status-badge ${this.getStatusClass(room.TrangThai)}">
                                ${this.getStatusText(room.TrangThai)}
                            </span>
                        </div>
                        ${room.MoTa ? `
                        <div class="detail-item full-width">
                            <label>Mô tả:</label>
                            <span>${room.MoTa}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        this.showModal('roomDetailsModal');
    }

    async exportData() {
        try {
            this.showLoading('Đang xuất dữ liệu...');
            
            const response = await fetch('/api/rooms?limit=1000');
            const result = await response.json();
            
            this.hideLoading();

            if (result.success) {
                this.downloadCSV(result.data.rooms);
            } else {
                this.showNotification('Lỗi xuất dữ liệu!', 'error');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error exporting data:', error);
            this.showNotification('Lỗi kết nối!', 'error');
        }
    }

    downloadCSV(rooms) {
        const headers = ['Mã phòng', 'Tên phòng', 'Địa chỉ', 'Giá thuê', 'Diện tích', 'Trạng thái', 'Mô tả'];
        const csvContent = [
            headers.join(','),
            ...rooms.map(room => [
                room.MaPhong,
                `"${room.TieuDe}"`,
                `"${room.DiaChi}"`,
                room.GiaThue,
                room.DienTich,
                this.getStatusText(room.TrangThai),
                `"${room.MoTa || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `rooms_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Utility methods
    getStatusClass(status) {
        const statusMap = {
            'conTrong': 'available',
            'dangThue': 'occupied', 
            'daDuyet': 'approved',
            'dangChoDuyet': 'pending'
        };
        return statusMap[status] || 'unknown';
    }

    getStatusText(status) {
        const statusMap = {
            'conTrong': 'Còn trống',
            'dangThue': 'Đang thuê',
            'daDuyet': 'Đã duyệt',
            'dangChoDuyet': 'Đang chờ duyệt'
        };
        return statusMap[status] || 'Không xác định';
    }

    mapStatusToValue(status) {
        const statusMap = {
            'conTrong': 'available',
            'dangThue': 'occupied',
            'daDuyet': 'approved',
            'dangChoDuyet': 'pending'
        };
        return statusMap[status] || 'available';
    }

    mapValueToStatus(value) {
        const valueMap = {
            'available': 'conTrong',
            'occupied': 'dangThue',
            'approved': 'daDuyet',
            'pending': 'dangChoDuyet'
        };
        return valueMap[value] || 'conTrong';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.currentPage = 1;
            this.loadRooms();
        }, 500);
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeRoomModal() {
        document.getElementById('roomModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.removeImage();
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    showLoading(message = 'Đang tải...') {
        // Create or update loading overlay
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
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

    async loadRoomCharts() {
        try {
            // ✅ SỬ DỤNG Dashboard API
            const response = await fetch('/api/dashboard/room-status-chart');
            const result = await response.json();
            
            if (result.success) {
                const ctx = document.getElementById('roomStatusChart').getContext('2d');
                
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Trống', 'Đã thuê', 'Chờ duyệt', 'Đã duyệt'],
                        datasets: [{
                            data: [
                                result.data.available,
                                result.data.occupied,
                                result.data.pending,
                                result.data.approved
                            ],
                            backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12', '#3498db']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }
        } catch (error) {
            console.error('Error loading room charts:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.roomsManager = new RoomsManagement();
}); 

// THÊM cleanup khi rời trang
window.addEventListener('beforeunload', () => {
    if (window.roomsManager) {
        window.roomsManager.destroy();
    }
});