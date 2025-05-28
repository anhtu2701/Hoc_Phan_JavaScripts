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
