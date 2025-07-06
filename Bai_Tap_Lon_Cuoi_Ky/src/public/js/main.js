// Global variables for house rendering
let houseIndex = 8;
const itemsPerClick = 8;

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

    // Filter Search Functionality - Fixed to work with API filters
    const searchForm = document.getElementById('search-filter');

    if (searchForm) {
        searchForm.addEventListener('submit', e => {
            e.preventDefault();

            const selectedDistrict = document.getElementById('district').value;
            const selectedPrice = document.getElementById('price').value;

            // Build API URL with filters
                let apiUrl = 'http://localhost:3000/api/rooms?status=conTrong&limit=100';
            
            // Add price filter 
            if (selectedPrice !== 'all') {
                const [minPrice, maxPrice] = selectedPrice.split('-').map(Number);
                apiUrl += `&min_price=${minPrice * 1000000}&max_price=${maxPrice * 1000000}`;
            }
            
            // Fetch filtered data from API directly
            const housesList = document.querySelector('.house-lists');
            if (housesList) {
                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Use the rendering function from renderHouseFromDataBase.js
                            window.renderRooms(data.data);
                            
                            // Reset the "Render More House" functionality for filtered results
                            const continueBtn = document.querySelector('.continue-btn');
                            const housesContinueElement = document.querySelector('.houses-continue');
                            const allHouses = housesList.querySelectorAll('.house-items');
                            
                            // Reset house index to 8 (showing first 8, hiding the rest)
                            houseIndex = 8;
                            
                            // Show/hide the "Xem thêm" button based on results
                            if (allHouses.length > 8) {
                                housesContinueElement.style.display = 'flex';
                                housesContinueElement.classList.add('scale-active');
                                
                                // Update the text to reflect filtered results
                                const spanElement = housesContinueElement.querySelector('span');
                                if (spanElement) {
                                    spanElement.textContent = `Còn ${allHouses.length - 8} phòng khác phù hợp với bộ lọc`;
                                }
                            } else {
                                housesContinueElement.style.display = 'none';
                            }
                        } else {
                            housesList.innerHTML = '<p>❌ Không tìm thấy phòng phù hợp với bộ lọc đã chọn.</p>';
                        }
                    })
                    .catch(error => {
                        housesList.innerHTML = '<p>❌ Lỗi kết nối. Vui lòng thử lại sau.</p>';
                    });
            }
        });
    }

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
    
    // Render More House
    const continueBtn = document.querySelector('.continue-btn');
    const housesContainer = document.querySelector('.house-lists');
    const housesContinueElement = document.querySelector('.houses-continue');

    function renderMoreHouses() {
        const allHouses = housesContainer.querySelectorAll('.house-items');
        endIndex = Math.min(houseIndex + itemsPerClick, allHouses.length);

        for (let i = houseIndex; i < endIndex; i++) {
            allHouses[i].style.display = 'block';
            setTimeout(() => {
                allHouses[i].classList.add('visible');
            }, 50 * (i - houseIndex));
        }
    
        houseIndex = endIndex;
    
        if (houseIndex >= allHouses.length) {
            housesContinueElement.style.display = 'none';
        }
    }
    
    // Reset continue button text to original when page loads
    function resetContinueButton() {
        const housesContinueElement = document.querySelector('.houses-continue');
        const spanElement = housesContinueElement.querySelector('span');
        if (spanElement) {
            spanElement.textContent = 'Tiếp tục khám phá danh mục toà nhà';
        }
    }
    
    // Call reset when page loads
    resetContinueButton();
    
    continueBtn.addEventListener('click', renderMoreHouses);
});
