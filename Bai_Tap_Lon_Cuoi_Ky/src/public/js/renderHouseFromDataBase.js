// Global variables
let allRooms = [];
let currentDisplayedRooms = 8; // Số phòng hiển thị ban đầu
const itemsPerLoad = 8; // Số phòng tải thêm mỗi lần

// Expose allRooms cho global scope
window.allRooms = allRooms;

// Hàm tải phòng từ database
async function loadRoomsFromDatabase() {
    try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        
        if (data.success) {
            const roomsData = data.data.rooms || data.data;

            if (Array.isArray(roomsData)) {
                allRooms = roomsData;
                window.allRooms = allRooms;
                console.log('Loaded rooms:', allRooms.length);
                renderInitialRooms();
            } else {
                console.error('roomsData is not an array:', roomsData);
                allRooms = [];
                window.allRooms = [];
                renderInitialRooms();
            }
        } else {
            console.error('API Error:', data.message);
            allRooms = [];
            window.allRooms = [];
            renderInitialRooms();
        }
    } catch (error) {
        console.error('Network Error:', error);
        allRooms = [];
        window.allRooms = [];
        renderInitialRooms();
    }
}

// Hàm hiển thị phòng ban đầu (8 phòng đầu tiên)
function renderInitialRooms() {
    const housesList = document.querySelector('.house-lists');
    if (!housesList) return;
    
    housesList.innerHTML = '';

    // Kiểm tra allRooms có phải là array không
    if (!Array.isArray(allRooms)) {
        console.error('allRooms is not an array:', allRooms);
        housesList.innerHTML = '<li class="no-rooms">Không có phòng nào để hiển thị</li>';
        return;
    }
    
    if (allRooms.length === 0) {
        housesList.innerHTML = '<li class="no-rooms">Không có phòng nào để hiển thị</li>';
        return;
    }
    
    // Hiển thị 8 phòng đầu tiên
    const initialRooms = allRooms.slice(0, currentDisplayedRooms);
    initialRooms.forEach(room => {
        const roomElement = createRoomElement(room);
        housesList.appendChild(roomElement);
    });

    // Trigger fade-in với stagger effect
    setTimeout(() => {
        triggerStaggeredFadeIn();
    }, 100);
    
    
    // Kiểm tra nút "Xem thêm"
    updateContinueButton();
}

// Hàm tạo element phòng theo format mới
function createRoomElement(room) {
    const li = document.createElement('li');
    li.className = 'house-items fade-in';
    
    // Kiểm tra trạng thái phòng để hiển thị nút đặt lịch
    const isAvailable = room.status === 'available';
    const bookingButtonHtml = isAvailable ? `
        <button class="btn-book-viewing" onclick="openBookingModal('${room.roomID}')">
            📅 Đặt lịch xem
        </button>
    ` : `
        <button class="btn-book-viewing disabled" disabled>
            ❌ ${room.status === 'occupied' ? 'Đã cho thuê' : 'Đang bảo trì'}
        </button>
    `;
    
    li.innerHTML = `
        <div class="house-item">
            <div class="house-img">
                <img src="${room.imageURL || '/img/houses/default.jpg'}" alt="${room.title}" />
            </div>
            <div class="house-content">
                <div class="house-district">${room.title}</div>
                <div class="house-address">${room.address}</div>
                <div class="house-id">Mã phòng: ${room.roomID}</div>
                <div class="house-area">Diện tích: ${room.area}m²</div>
                <div class="house-price">${formatPrice(room.price)}</div>
                <div class="house-status">Tình trạng: 
                    <span class="status-${room.status.toLowerCase()}">${getStatusText(room.status)}</span>
                </div>
                <div class="house-facilities">${room.description || 'Đang cập nhật'}</div>
                <div class="room-actions">
                    ${bookingButtonHtml}
                </div>
            </div>
        </div>
    `;
    
    return li;
}

// Hàm tải thêm phòng khi click "Xem thêm"
function loadMoreRooms() {
    const housesList = document.querySelector('.house-lists');
    if (!housesList) return;

    // Kiểm tra allRooms
    if (!Array.isArray(allRooms)) {
        console.error('allRooms is not an array:', allRooms);
        return;
    }
    
    // Tính toán phòng cần tải thêm
    const startIndex = currentDisplayedRooms;
    const endIndex = Math.min(startIndex + itemsPerLoad, allRooms.length);
    
    // Render phòng mới
    const newRooms = allRooms.slice(startIndex, endIndex);
    newRooms.forEach(room => {
        const roomElement = createRoomElement(room);
        housesList.appendChild(roomElement);
    });
    
    // Cập nhật số phòng đã hiển thị
    currentDisplayedRooms = endIndex;
    
    // Kiểm tra nút "Xem thêm"
    updateContinueButton();
    
    // Trigger fade-in animation cho các phòng mới
    setTimeout(() => {
        triggerStaggeredFadeIn();
    }, 100);
}

// Hàm cập nhật trạng thái nút "Xem thêm"
function updateContinueButton() {
    const continueBtn = document.querySelector('.continue-btn');
    const housesContinueSection = document.querySelector('.houses-continue');

    if (!continueBtn) return;
    
    if (currentDisplayedRooms >= allRooms.length) {
        housesContinueSection.style.display = 'none';
    } else {
        housesContinueSection.style.display = 'flex';
        continueBtn.textContent = 'Xem thêm';
        continueBtn.style.opacity = '1';
        continueBtn.style.cursor = 'pointer';
    }
}

// Hàm format giá
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Hàm chuyển đổi status text
function getStatusText(status) {
    const statusMap = {
        'available': 'Có sẵn',
        'occupied': 'Đã cho thuê',
        'maintenance': 'Bảo trì'
    };
    return statusMap[status] || status;
}

// Hàm trigger fade-in với stagger effect
function triggerStaggeredFadeIn() {
    const fadeElements = document.querySelectorAll('.house-items.fade-in:not(.visible)');
    fadeElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('visible');
        }, index * 150); // 150ms delay cho mỗi item
    });
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    loadRoomsFromDatabase();

    setTimeout(() => {
        const continueBtn = document.querySelector('.continue-btn');
        if (continueBtn) {
            console.log('Found continue button, adding event listener');
            continueBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Continue button clicked!');
                loadMoreRooms();
            });
        } else {
            console.error('Continue button not found');
        }
    }, 1000); // Đợi 1s để đảm bảo DOM đã render xong
});