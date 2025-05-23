var Array1 = [1, 2, 3, 4, 5];
var Array2 = new Array(10,9,8,7,6);


// Truy xuất mảng
console.log(Array1[0]); // 1

// Thuộc tính Length
console.log(Array1.length); // 5

// Hàm join
console.log(Array1.join(" ")); // 1 2 3 4 5

// Hàm concat
console.log(Array1.concat(Array2)); // 1,2,3,4,5,10,9,8,7,6

// Hàm slice
console.log(Array1.slice(0, 3)); // 1,2,3

// Hàm reverse
console.log(Array2.reverse()); // 6,7,8,9,10

// Hàm sort
console.log(Array2.sort((a, b) => a - b)); // 6,7,8,9,10
// Nếu sắp xếp tăng dần thì dùng (a, b) => a - b, giảm dần thì dùng (a, b) => b - a

// Hàm push
Array1.push(6); 
console.log(Array1); // 1,2,3,4,5,6

// Hàm pop
Array1.pop();
console.log(Array1); // 1,2,3,4,5

// Hàm shift
Array1.shift();
console.log(Array1); // 2,3,4,5

// Hàm unshift
Array1.unshift(1);
console.log(Array1); // 1,2,3,4,5

// Hàm indexOf
console.log(Array1.indexOf(3)); // 2