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
    return value.toLocale('vi-VN') + 'VNĐ';
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
                <button id="btnEdit" onclick="starEdit(${index})">Sửa</button>
                <button id="btnDelete" onclick="deleteProduct(${index})">Thêm</button>
                </td>
            </tr>
        `;
        productTable += tr;
    });
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

