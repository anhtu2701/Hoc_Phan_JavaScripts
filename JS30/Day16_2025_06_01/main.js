class Product {
    constructor(id, name, price, quantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    totalValue() {
        return this.price * this.quantity;
    }
}

const products = [
    new Product(1, 'Iphone 12', 6000000, 3),
    new Product(2, 'Samsung S6', 1000000, 4)
];

let editIndex = -1;

function formatCurrency(value) {
    return value.toLocaleString('vi-VN') + 'VNĐ';
}

function renderTable() {
    const productTable = document.getElementById('productTable');

    productTable.innerHTML = '';

    products.forEach((product, index) => {
        const tr = `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.quantity}</td>
                <td>${formatCurrency(product.totalValue())}</td>
                <td>
                <button id="btnEdit" onclick="startEdit(${index})">Sửa</button>
                <button id="btnDelete" onclick="deleteProduct(${index})">Xóa</button>
                </td>
            </tr>
        `;
        productTable.innerHTML += tr;
    });

    updateSummary()
}

function updateSummary() {
    const total = products.reduce((sum, product) => sum + product.totalValue(), 0);
    document.getElementById('totalValue').textContent = formatCurrency(total);

    if (products.length === 0) {
        document.getElementById('totalValue').textContent = 'Không có';
        return;
    }

    let maxPriceProduct = products.reduce((maxValue, product) => product.price > maxValue.price ? product : maxValue , products[0]);
    document.getElementById('mostExpensiveProduct').textContent = `${maxPriceProduct.name} (${formatCurrency(maxPriceProduct.price)})`;
}


// Function of BtnAdd
document.getElementById('btnAdd').addEventListener('click', ()=> {
    const id = Number(document.getElementById('inputID').value.trim());
    const name = document.getElementById('inputName').value.trim();
    const price = Number(document.getElementById('inputPrice').value.trim());
    const quantity = Number(document.getElementById('inputQuantity').value.trim());

    // Try except error
    const error = validateInputs(id, name, price, quantity);
    if (error) {
        document.getElementById('errorMessage').textContent = error;
        return;
    }

    // if you are editing 
    if (editIndex !== -1) {
        if (products.some((product, index) => product.id === id && index !== editIndex)) {
            alert('ID đã tồn tại. Vui lòng chọn ID khác.')
            return;
        }
        products[editIndex].id = id;
        products[editIndex].name = name;
        products[editIndex].price = price;
        products[editIndex].quantity = quantity;

        clearInputs();
        renderTable();
    }

    // Add Product
    if (products.some(product => product.id === id)) {
        alert('ID đã tồn tại. Vui lòng chọn ID khác.')
        return;
    }
    products.push(new Product(id, name, price, quantity));
    clearInputs();
    renderTable();
});

function startEdit(index) {
    const product = products[index];
    document.getElementById('inputID').value = product.id;
    document.getElementById('inputName').value = product.name;
    document.getElementById('inputPrice').value = product.price;
    document.getElementById('inputQuantity').value = product.quantity;
    editIndex = index;
    document.getElementById('btnAdd').textContent = 'Cập nhật';
    document.getElementById('errorMessage').textContent = '';
}

function deleteProduct(index) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        products.splice(index, 1);
        clearInputs();
        renderTable();
    }
}

function validateInputs(id, name, price, quantity) {
    if (!id || !name || !price || !quantity) {
        return "Vui lòng nhập đầy đủ thông tin."
    }
    if (price <= 0 || quantity <= 0) {
        return 'Giá và số lượng phải là 1 số lớn hơn 0.'
    }
    return '';
}

function clearInputs() {
    editIndex = -1;
    document.getElementById('inputID').value = '';
    document.getElementById('inputName').value = '';
    document.getElementById('inputPrice').value = '';
    document.getElementById('inputQuantity').value = '';
    document.getElementById('btnAdd').textContent = 'Thêm';
    document.getElementById('errorMessage').textContent = '';
}

renderTable();