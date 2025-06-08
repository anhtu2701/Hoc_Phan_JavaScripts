document.addEventListener('DOMContentLoaded', function () {
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
});
