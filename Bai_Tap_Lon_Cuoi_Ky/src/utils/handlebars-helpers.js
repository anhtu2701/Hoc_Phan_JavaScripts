module.exports = {
    firstChar: function(str) {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase();
    }
}; 