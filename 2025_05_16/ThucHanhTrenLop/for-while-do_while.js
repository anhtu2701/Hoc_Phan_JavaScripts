// For loop
for (let i = 0; i < 10; i++) {
    document.write("Anh xin lỗi em! <br>");
}

document.write("<hr>");
// While loop
var sum = 0
var j = 1;
while (j <= 100) {
    sum += j;
    j += 1;
}
document.write("Tổng từ 1 đến 100 là: " + sum);

document.write("<hr>");

// Do while loop
var j = 1;
do {
	document.write('Anh xin lỗi em <br>');
	j++;
} while(j <= 10);