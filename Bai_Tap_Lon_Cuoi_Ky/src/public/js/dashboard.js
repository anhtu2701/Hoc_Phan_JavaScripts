document.addEventListener("DOMContentLoaded", function () {
    // Initialize mobile toggle
    const mobileToggle = document.getElementById("mobile-toggle");
    const sidebar = document.getElementById("sidebar");

    mobileToggle?.addEventListener("click", function () {
        sidebar.classList.toggle("open");
    });
});
