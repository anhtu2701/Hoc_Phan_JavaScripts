var roomsAPI = "http://localhost:3000/api/rooms";

function start() {
    getRooms((response) => {
        if (response.success) {
            renderRooms(response.data);
        } else {
            console.error('Error loading rooms:', response.message);
        }
    });
}

// Đảm bảo DOM đã được tải trước khi chạy script
document.addEventListener('DOMContentLoaded', function() {
    start();
});

function getRooms(callback) {
    fetch(roomsAPI + '?limit=20&status=conTrong')
        .then(response => response.json())
        .then(callback)
        .catch(error => {
            console.error('Fetch error:', error);
            callback({ success: false, message: 'Không thể kết nối đến server' });
        });
}

function renderRooms(rooms) {
    var listRooms = document.querySelector('.house-lists');
    
    if (!listRooms) {
        console.error('Element .house-lists not found!');
        return;
    }
    
    if (!rooms || rooms.length === 0) {
        listRooms.innerHTML = '<p>Không có phòng trọ nào.</p>';
        return;
    }

    var htmls = rooms.map((room) => /*html*/`
        <li class="house-items fade-in">
            <div class="house-item">
                <div class="house-img">
                    <img src="${room.URLAnhPhong || '/img/houses/default.jpg'}" alt="${room.TieuDe}">
                </div>
                <div class="house-content">
                    <div class="house-district">${room.TieuDe}</div>
                    <div class="house-address">${room.DiaChi}</div>
                    <div class="house-id">Mã phòng: ${room.MaPhong}</div>
                    <div class="house-area">Diện tích: ${room.DienTich}m²</div>
                    <div class="house-price">${formatPrice(room.GiaThue)}</div>
                    <div class="house-status">Tình trạng: 
                        <span class="status-${room.TrangThai}">${getStatusText(room.TrangThai)}</span>
                    </div>
                    <div class="house-facilities">${room.MoTa || 'Đang cập nhật'}</div>
                </div>
            </div>
        </li>
    `);
    
    listRooms.innerHTML = htmls.join('');
    
    // Thêm visible class với animation
    setTimeout(() => {
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 100);
        });
    }, 100);
}

// Hàm format giá tiền
function formatPrice(price) {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Hàm chuyển đổi trạng thái
function getStatusText(status) {
    const statusMap = {
        'conTrong': 'Còn trống',
        'dangThue': 'Đang thuê',
        'dangChoDuyet': 'Đang chờ duyệt',
        'daDuyet': 'Đã duyệt'
    };
    return statusMap[status] || status;
}

// Hàm tìm kiếm phòng
function searchRooms(searchTerm, filters = {}) {
    let apiUrl = roomsAPI + '/search?q=' + encodeURIComponent(searchTerm);
    
    // Thêm các filter
    if (filters.minPrice) apiUrl += '&min_price=' + filters.minPrice;
    if (filters.maxPrice) apiUrl += '&max_price=' + filters.maxPrice;
    if (filters.minArea) apiUrl += '&min_area=' + filters.minArea;
    if (filters.maxArea) apiUrl += '&max_area=' + filters.maxArea;
    if (filters.status) apiUrl += '&status=' + filters.status;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                renderRooms(response.data);
            } else {
                console.error('Lỗi khi tìm kiếm:', response.message);
            }
        })
        .catch(error => {
            console.error('Lỗi khi gọi API tìm kiếm:', error);
        });
}