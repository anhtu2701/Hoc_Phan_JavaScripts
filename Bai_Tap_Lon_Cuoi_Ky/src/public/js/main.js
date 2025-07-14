let houseIndex = 8;
const itemsPerClick = 8;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    // Scroll Header Effects
    const header = document.querySelector('header');
    let lastScrollDirection = 0;

    window.addEventListener('scroll', () => {
        const currentScrollDirection = window.pageYOffset;

        if (currentScrollDirection > lastScrollDirection && currentScrollDirection > 100) {
            header.classList.add('hide-header');
            header.classList.remove('show-header');
        } else {
            header.classList.remove('hide-header');
            header.classList.add('show-header');
        }

        lastScrollDirection = currentScrollDirection;
    });


    // Slider Animation
    const sliderTrack = document.querySelector('.slider-track');
    const sliderItems = document.querySelectorAll('.slider-item');
    const sliderDots = document.querySelectorAll('.slider-dot');
    const prevBtnSlider = document.querySelector('.slider-btn.prev-btn');
    const nextBtnSlider = document.querySelector('.slider-btn.next-btn');
    
    let currentIndex = 0;
    
    function updateSliderAndDot() {
        sliderTrack.style.transform = `translateX(-${currentIndex * 100}vw)`;
    
        sliderDots.forEach((sliderDot, index) => {
            sliderDot.classList.toggle('selected', index === currentIndex)
        });
    }
    
    function handleBtnClick(direction) {
        if (direction === 'next' && currentIndex < sliderItems.length - 1) {
            currentIndex++;
        } else if (direction === 'prev' && currentIndex > 0) {
            currentIndex--;
        }
        updateSliderAndDot()
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateSliderAndDot()
    }
    
    updateSliderAndDot();
    
    sliderDots.forEach((sliderDot, index) => {
        sliderDot.addEventListener('click', () => goToSlide(index))
    });
    
    prevBtnSlider.addEventListener('click', () => handleBtnClick('prev'));
    nextBtnSlider.addEventListener('click', () => handleBtnClick('next'));
    
    
    // Back to top button
    const backToTopBtn = document.querySelector('.back-to-top');
    const sideMenuContacts = document.querySelector('.side-menu-contacts');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            sideMenuContacts.classList.add('show');
        } else {
            sideMenuContacts.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    });

    // Sidebar
    const sidebarShowBtn = document.getElementById('sidebarShow');
    const sidebarHiddenBtn = document.getElementById('sidebarHidden');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarContainer = document.querySelector('.sidebar');

    function sidebarOpen() {
        sidebarContainer.classList.add('show-sidebar')
        sidebarOverlay.classList.add('show-sidebar')
    }

    function sidebarRemove() {
        sidebarContainer.classList.remove('show-sidebar')
        sidebarOverlay.classList.remove('show-sidebar')
    }

    sidebarShowBtn.addEventListener('click',sidebarOpen);
    sidebarHiddenBtn.addEventListener('click',sidebarRemove);
    sidebarOverlay.addEventListener('click',sidebarOpen);

    // Fade-in House
    const fadeElements = document.querySelectorAll('.fade-in');

    function checkFade() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    }

    checkFade();
    window.addEventListener('scroll', checkFade);

    // Scale element
    const scaleElements = document.querySelectorAll('.scale-element');
    function scaleFade() {
        scaleElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 20;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('scale-active');
            }
        });
    }
    scaleFade();
    window.addEventListener('scroll', scaleFade);
    
    initializeBookingFeatures();
    
    // Đặt ngày hiện tại today
    const today = new Date().toISOString().split('T')[0];
    const viewDateInput = document.getElementById('view-date');
    if (viewDateInput) {
        viewDateInput.min = today;
    }
});


// hàm khởi tạo các tính năng đặt lịch xem phòng
function initializeBookingFeatures() {
    // hàm đặt lịch xem phòng
    const bookingForm = document.getElementById('booking-form');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
}

// thêm hàm hiển thị modal
function openBookingModal(roomId) {
    const room = allRooms.find(r => r.roomID === roomId);
    if (!room) return;
    
    // Điền thông tin phòng vào modal
    document.getElementById('modal-room-id').value = roomId;
    document.getElementById('modal-room-image').src = room.imageURL || '/img/houses/default.jpg';
    document.getElementById('modal-room-title').textContent = room.title;
    document.getElementById('modal-room-address').textContent = room.address;
    document.getElementById('modal-room-price').textContent = formatPrice(room.price);
    
    // Hiện modal
    document.getElementById('booking-modal').style.display = 'flex';
}

function closeBookingModal() {
    document.getElementById('booking-modal').style.display = 'none';
    document.getElementById('booking-form').reset();
}



// Thêm hàm đặt lịch xem phòng
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        roomID: formData.get('roomId'),
        viewDate: formData.get('viewDate'),
        timeSlot: formData.get('timeSlot'),
        note: formData.get('note')
    };
    
    try {
        const response = await fetch('/api/viewings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đặt lịch thành công!');
            closeBookingModal();
            // Reload user viewings if section is visible
            if (document.getElementById('my-viewings-section').style.display !== 'none') {
                loadUserViewings();
            }
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('Có lỗi xảy ra khi đặt lịch');
    }
}

// thêm hàm hiển thị viewings 
async function showMyViewings() {
    const section = document.getElementById('my-viewings-section');
    
    // Hiện viewings section
    if (section) {
        section.style.display = 'block';
        await loadUserViewings();
        
        // Scroll tới section
        section.scrollIntoView({ behavior: 'smooth' });
    }
}


async function loadUserViewings() {
    try {
        const response = await fetch('/api/viewings');
        const data = await response.json();
        
        if (data.success) {
            renderUserViewings(data.data);
        } else {
            console.error('Error loading viewings:', data.message);
        }
    } catch (error) {
        console.error('Error loading viewings:', error);
    }
}


function renderUserViewings(viewings) {
    const container = document.getElementById('viewings-list');
    if (!container) {
        console.error('Viewings container not found!');
        return;
    }
    
    if (viewings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <p>Bạn chưa có lịch hẹn nào</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = viewings.map(viewing => `
        <div class="viewing-card">
            <div class="viewing-card-header">
                <h4>${viewing.roomTitle || 'Không có tên'}</h4>
                <span class="viewing-date">${formatDate(viewing.viewDate)}</span>
            </div>
            <div class="viewing-card-body">
                <div class="viewing-info">
                    <div class="viewing-info-item">
                        <i class="fas fa-clock"></i>
                        <span>${viewing.timeSlot}</span>
                    </div>
                    <div class="viewing-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${viewing.address || 'Không có địa chỉ'}</span>
                    </div>
                    <div class="viewing-info-item">
                        <i class="fas fa-info-circle"></i>
                        <span class="viewing-status status-${viewing.status.toLowerCase()}">
                            ${getViewingStatusText(viewing.status)}
                        </span>
                    </div>
                </div>
                <div class="viewing-actions">
                    ${viewing.status === 'confirmed' ? `
                        <button class="btn-action cancel" onclick="cancelViewing(${viewing.viewingID})">
                            <i class="fas fa-times"></i> Hủy lịch
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// hàm format date và status
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function getViewingStatusText(status) {
    const statusMap = {
        'confirmed': 'Đã xác nhận',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

// Đóng modal khi click ngoài
window.addEventListener('click', function(e) {
    const bookingModal = document.getElementById('booking-modal');
    
    if (e.target === bookingModal) {
        closeBookingModal();
    }
});

// Widget functionality
function toggleUserWidget() {
    const widget = document.getElementById('userWidgetContent');
    if (!widget) return;
    
    if (widget.classList.contains('active')) {
        widget.classList.remove('active');
        setTimeout(() => {
            widget.style.display = 'none';
        }, 300);
    } else {
        widget.style.display = 'block';
        setTimeout(() => {
            widget.classList.add('active');
        }, 10);
    }
}

// Widget action handler
function handleWidgetAction(action) {
    // Đóng widget trước
    toggleUserWidget();
    
    // Thực hiện action
    setTimeout(() => {
        if (action === 'viewings') {
            showMyViewings();
        }
    }, 300);
}

// Click outside to close widget
document.addEventListener('click', function(event) {
    const widget = document.getElementById('userWidgetContent');
    const toggle = document.querySelector('.widget-toggle');
    
    if (widget && widget.classList.contains('active')) {
        if (!widget.contains(event.target) && !toggle.contains(event.target)) {
            toggleUserWidget();
        }
    }
});

// ESC key to close widget
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const widget = document.getElementById('userWidgetContent');
        if (widget && widget.classList.contains('active')) {
            toggleUserWidget();
        }
    }
});

// Hàm load khung giờ đã đặt của user
async function loadUserBookedSlots(viewDate) {
    try {
        const response = await fetch('/api/viewings');
        const data = await response.json();
        
        if (data.success) {
            // Lọc lịch hẹn trong ngày đã chọn
            const bookedOnDate = data.data.filter(viewing => 
                viewing.viewDate.split('T')[0] === viewDate && 
                viewing.status === 'confirmed'
            );
            
            return bookedOnDate.map(viewing => viewing.timeSlot);
        }
        
        return [];
    } catch (error) {
        console.error('Error loading user booked slots:', error);
        return [];
    }
}

// Cập nhật UI khung giờ để hiển thị conflict
async function updateTimeSlotOptions(roomID, viewDate) {
    try {
        // Lấy khung giờ trống của phòng
        const response = await fetch(`/api/viewings/available-slots/${roomID}/${viewDate}`);
        const roomData = await response.json();
        
        // Lấy khung giờ đã đặt của user
        const userBookedSlots = await loadUserBookedSlots(viewDate);
        
        if (roomData.success) {
            const timeSlotSelect = document.getElementById('timeSlot');
            timeSlotSelect.innerHTML = '<option value="">Chọn khung giờ</option>';
            
            const allSlots = [
                '08:00-09:00', '09:00-10:00', '10:00-11:00',
                '13:00-14:00', '14:00-15:00', '15:00-16:00'
            ];
            
            allSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                
                if (roomData.data.bookedSlots.includes(slot)) {
                    option.textContent = `${slot} (Đã có người đặt)`;
                    option.disabled = true;
                } else if (userBookedSlots.includes(slot)) {
                    option.textContent = `${slot} (Bạn đã đặt phòng khác)`;
                    option.disabled = true;
                    option.style.color = '#ff6b6b';
                } else {
                    option.textContent = slot;
                }
                
                timeSlotSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error updating time slot options:', error);
    }
}

async function cancelViewing(viewingID) {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/viewings/${viewingID}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Hủy lịch thành công!');
            loadUserViewings();
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Error cancelling viewing:', error);
        alert('Có lỗi xảy ra khi hủy lịch');
    }
}