document.addEventListener("DOMContentLoaded", function () {
    // Toggle sidebar
    const mobileToggle = document.getElementById("mobile-toggle");
    const sidebar = document.getElementById("sidebar");

    mobileToggle?.addEventListener("click", function () {
        sidebar.classList.toggle("open");
    });

    // Logout functionality
    const logoutBtn = document.getElementById("logoutBtn");
    
    logoutBtn?.addEventListener("click", function () {
        // Show confirmation dialog
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            // Create form and submit logout request
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/logout';
            
            // Add CSRF token if needed (you can add this later if you implement CSRF protection)
            // const csrfToken = document.querySelector('meta[name="csrf-token"]');
            // if (csrfToken) {
            //     const csrfInput = document.createElement('input');
            //     csrfInput.type = 'hidden';
            //     csrfInput.name = '_token';
            //     csrfInput.value = csrfToken.getAttribute('content');
            //     form.appendChild(csrfInput);
            // }
            
            document.body.appendChild(form);
            form.submit();
        }
    });
});
