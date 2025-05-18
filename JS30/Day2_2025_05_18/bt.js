// 1. Tính số Fibonacci thứ n

function fibonacci(n) {
    let a = 0, b = 1, c
    if (n === 0) { return 0}
    if (n === 1) { return 1}
    for (let i = 0; i <= n; i++) {
      c = a + b
      a = b
      b = c
    }
    return b
  }
  
  // console.log(fibonacci(4))
  
  // 2. Đảo ngược một chuỗi
  
  function daoNguocChuoi(str) {
    var res = ''
    for (let i = str.length - 1; i >= 0; i--) {
      res += str[i]
    }
    return res
  }
  
  // console.log(daoNguocChuoi("hello"))
  
  //  3. Kiểm tra năm nhuận
  
  function laNamNhuan(nam) {
    if ((nam % 4 === 0 && nam % 100 !== 0) || (nam % 400 === 0)) {
      return "La nam nhuan"
    }
    return "Khong la nam nhuan"
  }
  
  // console.log(laNamNhuan(20))
  
  // 4. Kiểm tra mật khẩu mạnh
  function kiemTraMatKhau(matkhau) {
    if (matkhau.length < 8) {return false}
    if (!/[A-Z]/.test(matkhau)) {return false}
    if (!/[a-z]/.test(matkhau)) {return false}
    if (!/\d/.test(matkhau)) {return false}
    return true
  }
  
  // console.log(kiemTraMatKhau("dsdasdsadadas2A"))