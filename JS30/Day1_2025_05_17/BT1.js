function kiemTraChanLe(number) {
    if (number % 2 == 0) { 
        console.log("Số Chẵn")
    } else {
        console.log("Số Lẻ")
    }
}

var n = parseInt(prompt("Nhập số cần kiểm tra: "))
kiemTraChanLe(n)