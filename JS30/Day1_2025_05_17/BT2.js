function tinhGiaiThua(n) {
    let res = 1
    for ( let i = 1; i < n+1; i++) {
        res *= i
    }
    return res
}

var n = parseInt(prompt("Nhập số cần tính giai thừa: "))
console.log(tinhGiaiThua(n))