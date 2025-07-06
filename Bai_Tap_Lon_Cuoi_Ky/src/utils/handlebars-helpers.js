// Handlebars helper functions

module.exports = {
    // Helper to get first character of a string
    firstChar: function(str) {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase();
    },

    // Helper to get substring
    substring: function(str, start, end) {
        if (!str || typeof str !== 'string') return '';
        return str.substring(start, end).toUpperCase();
    },

    // Helper to format currency
    formatCurrency: function(amount) {
        if (!amount) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },

    // Helper to format date
    formatDate: function(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('vi-VN');
    },

    // Helper to check if user has specific role
    hasRole: function(userRole, requiredRole) {
        return userRole === requiredRole;
    },

    // Helper for conditional equality
    eq: function(a, b) {
        return a === b;
    },

    // Helper for conditional inequality
    ne: function(a, b) {
        return a !== b;
    }
}; 