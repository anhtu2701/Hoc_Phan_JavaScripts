const track = document.querySelector('.track');
const items = document.querySelectorAll('.item');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.nav-btn.left');
const nextBtn = document.querySelector('.nav-btn.right');

let currentIndex = 0;

function updateSliderAndDot() {
    track.style.transform = `translateX(-${currentIndex * 1000}px)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle('selected', index === currentIndex)
    });
}

function handleBtnClick(direction) {
    if (direction === 'next' && currentIndex < items.length - 1) {
        currentIndex++;
    } else if (direction === 'prev' && currentIndex > 0) {
        currentIndex--;
    }
    updateSliderAndDot();
}

function goTo(index) {
    currentIndex = index;
    updateSliderAndDot();
}

// Initial
updateSliderAndDot();

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goTo(index) )
});

nextBtn.addEventListener('click', () => handleBtnClick('next'));
prevBtn.addEventListener('click', () => handleBtnClick('prev'));

