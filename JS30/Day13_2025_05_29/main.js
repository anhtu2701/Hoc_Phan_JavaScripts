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

    cellMaSV.textContent = maSinhVien;
    cellHoTen.textContent = hoTen;
    cellEmail.textContent = email;
    cellSDT.textContent = soDienThoai;

    newRow.appendChild(cellMaSV);
    newRow.appendChild(cellHoTen);
    newRow.appendChild(cellEmail);
    newRow.appendChild(cellSDT);

    table.appendChild(newRow);

    document.getElementById('maSinhVien').value = '';
    document.getElementById('hoTen').value = '';
    document.getElementById('email').value = '';
    document.getElementById('soDienThoai').value = '';

    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
 
    document.getElementById('maSinhVien').focus();
}

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                themSinhVien();
            }
        });
    });
});