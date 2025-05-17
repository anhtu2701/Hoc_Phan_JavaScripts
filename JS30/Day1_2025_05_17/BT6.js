function laSoNguyenTo(n) {
    if (n < 2) {
        return false;
    }
    for (let i = 2; i <= parseInt(n) ** 0.5; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}

var n = parseInt(prompt());
if (laSoNguyenTo(n)) {
    console.log('La so nguyen to');
} else {
    console.log('Khong so nguyen to');
}