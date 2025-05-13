var a = parseInt(prompt('Nhập số nguyên a: '));
var b = parseInt(prompt('Nhập số nguyên b: '));

// IF-ELSE
if (a > b) {
    alert('a lớn hơn b');
} else {
    alert('a không lớn hơn b');
}

// IF-ELSE Lồng Nhau
if (a % 2 == 0) {
    if (a > 0) {
        alert('a là số chẵn dương');
    }
    else if (a < 0) {
        alert('a là số chẵn âm');
    } else {
        alert('a là số 0');
    }
}

var a = 5;

switch (a) {
    case 0:
        document.write('không');
        break;
    case 1:
        document.write('Một');
        break;
    case 2:
        document.write('Hai');
        break;
    case 3:
        document.write('Ba');
        break;
    case 4:
        document.write('Bốn');
        break;
    case 5:
        document.write('Năm');
        break;
    default:
        document.write('Không thỏa mãn');
        break;
}

