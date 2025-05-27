function changeTitle() {
    const titleElement = document.querySelector('.article-title a');

    if (titleElement) {
        const newTitle = "Sinh viên UDU Top 1 Sever Hoàng Quốc Việt";
        titleElement.textContent = newTitle;
        document.title = newTitle;
    }
}

window.addEventListener('load', changeTitle);

let lastUrl = location.href;
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        changeTitle();
    }
}).observe(document, { subtree: true, childList: true });