let isEditMode = false;
let editingRowIndex = -1;


function kiemTraDuLieu() {
    let isValid = true;
    
    const maSinhVien = document.getElementById('maSinhVien').value.trim();
    const hoTen = document.getElementById('hoTen').value.trim();
    const email = document.getElementById('email').value.trim();
    const soDienThoai = document.getElementById('soDienThoai').value.trim();
    
    document.getElementById('errorMaSV').style.display = 'none';
    document.getElementById('errorHoTen').style.display = 'none';
    document.getElementById('errorEmail').style.display = 'none';
    document.getElementById('errorSDT').style.display = 'none';
    
    if (maSinhVien === '') {
        document.getElementById('errorMaSV').style.display = 'block';
        isValid = false;
    }
    
    if (hoTen === '') {
        document.getElementById('errorHoTen').style.display = 'block';
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '' || !emailRegex.test(email)) {
        document.getElementById('errorEmail').style.display = 'block';
        isValid = false;
    }
    
    if (soDienThoai === '') {
        document.getElementById('errorSDT').style.display = 'block';
        isValid = false;
    }
    
    return isValid;
}

function kiemTraMaSinhVienTrung(maSinhVien) {
    const table = document.getElementById('danhSachSinhVien');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        if (isEditMode && i === editingRowIndex) {
            continue
        }

        const cells = rows[i].getElementsByTagName('td');
        if (cells.length > 0 && cells[0].textContent === maSinhVien) {
            return true;
        }
    }
    return false;
}

function themSinhVien() {
    if (!kiemTraDuLieu()) {
        return;
    }

    const maSinhVien = document.getElementById('maSinhVien').value.trim();
    const hoTen = document.getElementById('hoTen').value.trim();
    const email = document.getElementById('email').value.trim();
    const soDienThoai = document.getElementById('soDienThoai').value.trim();
    
    if (kiemTraMaSinhVienTrung(maSinhVien)) {
        document.getElementById('errorMaSV').textContent = 'Mã sinh viên đã tồn tại';
        document.getElementById('errorMaSV').style.display = 'block';
        return;
    }

    const table = document.getElementById('danhSachSinhVien');

    const newRow = document.createElement('tr');

    const cellMaSV = document.createElement('td');
    const cellHoTen = document.createElement('td');
    const cellEmail = document.createElement('td');
    const cellSDT = document.createElement('td');
    const cellAction = document.createElement('td');

    cellMaSV.textContent = maSinhVien;
    cellHoTen.textContent = hoTen;
    cellEmail.textContent = email;
    cellSDT.textContent = soDienThoai;

    const editButton = document.createElement('button');
    editButton.textContent = "Sửa";
    editButton.className = 'btn-edit';
    editButton.onclick = function() { suaSinhVien(this.parentElement.parentElement); };
    cellAction.appendChild(editButton);

    newRow.appendChild(cellMaSV);
    newRow.appendChild(cellHoTen);
    newRow.appendChild(cellEmail);
    newRow.appendChild(cellSDT);
    newRow.appendChild(cellAction);

    table.appendChild(newRow);

    resetForm();
    showSuccessMessage("Thêm sinh viên thành công!");
}

function suaSinhVien(row) {
    const previousEditingRow = document.querySelector('.editing-row');
    if (previousEditingRow) {
        previousEditingRow.classList.remove('editing-row')
    }
    
    row.classList.add('editing-row');
    
    const cells = row.getElementsByTagName('td');
    
    document.getElementById('maSinhVien').value = cells[0].textContent;
    document.getElementById('hoTen').value = cells[1].textContent;
    document.getElementById('email').value = cells[2].textContent;
    document.getElementById('soDienThoai').value = cells[3].textContent;
    
    isEditMode = true;
    editingRowIndex = Array.from(row.parentElement.children).indexOf(row);
    
    const actionButton = document.getElementById('actionButton');
    actionButton.textContent = "Lưu";
    actionButton.classList.add('save-mode');
    
    document.getElementById('maSinhVien').focus();
};

function luuSinhVien() {
    if (!kiemTraDuLieu()) {
        return;
    }
    
    const maSinhVien = document.getElementById('maSinhVien').value.trim();
    const hoTen = document.getElementById('hoTen').value.trim();
    const email = document.getElementById('email').value.trim();
    const soDienThoai = document.getElementById('soDienThoai').value.trim();

    if (kiemTraMaSinhVienTrung(maSinhVien)) {
        document.getElementById('errorMaSV').textContent = 'Mã sinh viên đã tồn tại!';
        document.getElementById('errorMaSV').style.display = 'block';
        return;
    }
    
    const table = document.getElementById('danhSachSinhVien')
    const rows = table.getElementsByTagName('tr');
    const editingRow = rows[editingRowIndex];
    const cells = editingRow.getElementsByTagName('td');
    
    cells[0].textContent  = maSinhVien;
    cells[1].textContent  = hoTen;
    cells[2].textContent  = email;
    cells[3].textContent  = soDienThoai;
    
    editingRow.classList.remove('editing-row');
    
    resetToAddMode();
    resetForm();
    showSuccessMessage('Cập nhật sinh viên thành công!');
}

function resetToAddMode() {
    isEditMode = false;
    editingRowIndex = -1
    const actionButton = document.getElementById('actionButton');
    actionButton.textContent = "Thêm";
    actionButton.classList.remove('save-mode')
    
    const editingRows = document.querySelectorAll('.editing-row');
    editingRows.forEach(row => row.classList.remove('editing-row'));
}

function resetForm() {
    document.getElementById('maSinhVien').value = '';
    document.getElementById('hoTen').value = '';
    document.getElementById('email').value = '';
    document.getElementById('soDienThoai').value = '';
    document.getElementById('maSinhVien').focus();
}

function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function handleFormSubmit() {
    if (isEditMode) {
        luuSinhVien();
    } else {
        themSinhVien();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleFormSubmit();
            }
        });
    });
});