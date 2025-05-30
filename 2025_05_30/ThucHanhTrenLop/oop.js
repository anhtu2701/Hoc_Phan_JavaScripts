// Cách 1: Tạo đối tượng bằng object literal

const students = {
    id: 'b24dccc273',
    name: 'Hoang Anh Tu',
    salary: 40000000
};

console.log(`${students.id} ${students.name} ${students.salary}`)

// Tạo đối tượng bằng new Object

var student = new Object();
student.id = 'b24dccc273';
student.name = 'Hoang Anh Tu';
student.salary = 40000000;
console.log(`${student.id} ${student.name} ${student.salary}`);

// Cách 3: Tạo đối tượng bằng hàm khởi tạo constructor của Object
function Student(id,name,salary) {  
    this.id = id;  
    this.name = name;  
    this.salary = salary;  
}  
Tu = new Student('b24dccc273',"Hoang Anh Tu",40000000);
console.log(`${Tu.id} ${Tu.name} ${Tu.salary}`)

// Cách 4: Tạo đối tượng bằng cách tạo ra 1 lớp và định nghĩa phương thức

class Person {
    constructor(id, name, salary) {
        this.id = id;  
        this.name = name;  
        this.salary = salary; 
    }

    displayInfo() {
        console.log(`${this.id} ${this.name} ${this.salary}`);    
    }
}

var HoangTu = new Person('b24dccc273', 'Hoang Anh Tu', 40000000)
HoangTu.displayInfo()


// Prototype

function Student() {
    this.name = 'John';
    this.gender = 'M';
}

Student.prototype.age = 15;

var studObj1 = new Student();
console.log(studObj1.age);

var studObj2 = new Student();
console.log(studObj2.age);