function tongSoLe(n) {
    let res = 0
    for (let i = 1; i < n; i++) {
        if (i % 2 != 0) {
            res += i
        }
    }
    return res
}

var n = parseInt(prompt())
console.log(tongSoLe(n))