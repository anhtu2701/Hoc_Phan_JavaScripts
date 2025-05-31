//  Bài tập 1: Tạo lớp Student và in thông tin sinh viên

class Student {
    constructor(id, name, email, age) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
    }

    displayInfo() {
        console.log(`ID: ${this.id}`);
        console.log(`Name: ${this.name}`);
        console.log(`Email: ${this.email}`);
        console.log(`Age: ${this.age}`);
        console.log("--------------")
    }
}

const student_1 = new Student('B24DCCC273', 'Hoang Anh Tu', 'tuah.ptit@gmail.com', 18);
const student_2 = new Student('B24DCCC274', 'Tran Van Hoang', 'hoangtv.ptit@gmail.com', 18);


student_1.displayInfo();
student_2.displayInfo();


// Bài tập 2: Tính lương nhân viên

class Employee {
    constructor(name, position, baseSalary, workingDays) {
        this.name = name;
        this.position = position;
        this.baseSalary = baseSalary;
        this.workingDays = workingDays;
        this.totalSalary = (this.calculateSalary()).toLocaleString('vi-VN');
    }

    calculateSalary() {
        return this.baseSalary * this.workingDays
    }

    show() {
        console.log(`Name: ${this.name}`);
        console.log(`Positon: ${this.position}`);
        console.log(`baseSalary: ${this.baseSalary}`);
        console.log(`workingDays: ${this.workingDays}`);
        console.log(`totalSalary: ${this.totalSalary}`);
        console.log("--------------")
    }
}

const employee_1 = new Employee('Hoang Tu', 'director', '1000000000', 1)
const employee_2 = new Employee('Tran Van Hoang','osin', 100000, 8 )

employee_1.show();
employee_2.show();


// Bài tập 3: Quản lý danh sách sản phẩm

class Product {
    constructor(id, name, price, quantity) {
        this.id = id; 
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.totalPrice = this.calTotalPrice();
    }

    calTotalPrice() {
        return this.price * this.quantity;
    }

    displayInfo() {
        console.log(`ID: ${this.id} | Name: ${this.name} | Price: ${this.price} | SL: ${this.quantity} | totalPrice: ${this.totalPrice.toLocaleString('vi-VN')} VND`)
    }
}

const products = [
    new Product('SP01', 'Asus Rog Strix', 20000000, 13),
    new Product('SP02', 'Acer Nitro 5', 22000000, 5)
];

function addProduct(id, name, price, quantity) {
    const newProduct = new Product(id, name, price, quantity);
    products.push(newProduct);
}

function calSumValueProduct(products) {
    let totalValue = 0;
    for (product of products) {
        totalValue += product.totalPrice;
    }
    return totalValue;
}

function findMaxValue(products) {
    let maxValue = 0;
    let productMaxValue = ''
    for (product of products) {
        if (product.price > maxValue) {
            maxValue = product.price;
            productMaxValue = product.name;
        }
    }
    return `Sản phẩm có giá cao nhất là: ${productMaxValue}`;
}

// Demo

addProduct('SP03', 'Lenovo Legion 5', '25000000', 14);
addProduct('SP04', 'LOQ 2025', '30000000', 4);

var sumValueProduct = calSumValueProduct(products);
console.log(`Tổng giá trị hàng tồn kho là: ${sumValueProduct}`);

var maxValue = findMaxValue(products);
console.log(maxValue)


