function tongChuSo(n) {
    let sum = 0
    while (n != 0) {
        sum += (n % 10)
        n = parseInt(n / 10)
    }
    return sum
}

var n = parseInt(prompt())
console.log(tongChuSo(n))