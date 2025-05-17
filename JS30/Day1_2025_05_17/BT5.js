function bangCuuChuong(n) {
    for (let i = 1; i <= 10; i++) {
        console.log(n + 'x' + i + '=' + i * n);
    }
}

var n = parseInt(prompt());
bangCuuChuong(n);