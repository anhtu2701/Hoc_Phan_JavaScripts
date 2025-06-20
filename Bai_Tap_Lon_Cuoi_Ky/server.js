const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// Cấu hình kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Htu0404@',
    database: 'quan_ly_phong_tro'
});

// Kiểm tra kết nối MySQL
db.connect((err) => {
    if (err) {
        console.log('Kết nối MySQL thất bại:', err);
    } else {
        console.log('Kết nối MySQL thành công!');
    }
});

// Cấu hình Express để phục vụ các tệp tĩnh (CSS, JS, hình ảnh)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Route cho trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route cho trang login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// API lấy danh sách người dùng từ bảng NGUOIDUNG
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM NGUOIDUNG', (err, results) => {
        if (err) {
            res.status(500).send('Lỗi khi truy vấn cơ sở dữ liệu.');
        } else {
            res.json(results);  // Trả về dữ liệu dạng JSON
        }
    });
});

// API lấy danh sách phòng từ bảng PHONG
app.get('/api/rooms', (req, res) => {
    db.query('SELECT * FROM PHONG', (err, results) => {
        if (err) {
            res.status(500).send('Lỗi khi truy vấn cơ sở dữ liệu.');
        } else {
            res.json(results);  // Trả về dữ liệu dạng JSON
        }
    });
});

//   API lấy danh sách hợp đồng từ bảng PHONG_CHO_DUYET
app.get('/api/pending-rooms', (req, res) => {
    db.query('SELECT * FROM PHONG_CHO_DUYET', (err, results) => {
        if (err) {
            res.status(500).send('Lỗi khi truy vấn cơ sở dữ liệu.');
        } else {
            res.json(results);
        }
    });
});
// API lấy danh sách hợp đồng từ bảng HOP_DONG
app.get('/api/contracts', (req, res) => {
    db.query('SELECT * FROM HOPDONG', (err, results) => {
        if (err) {
            res.status(500).send('Lỗi khi truy vấn cơ sở dữ liệu.');
        } else {
            res.json(results);
        }
    });
});

// API lấy danh sách hợp đồng từ bảng THANHTOAN
app.get('/api/payments', (req, res) => {
    db.query('SELECT * FROM THANHTOAN', (err, results) => {
        if (err) {
            res.status(500).send('Lỗi khi truy vấn cơ sở dữ liệu.');
        } else {
            res.json(results);
        }
    });
});

// API lấy danh sách hợp đồng từ bảng PHANHOI
app.get('/api/feedback', (req, res) => {
    db.query('SELECT * FROM PHANHOI', (err, results) => {
        if (err) {
            res.status(500).send('Lỗi khi truy vấn cơ sở dữ liệu.');
        } else {
            res.json(results);
        }
    });
});

// API lấy danh sách hợp đồng từ bảng THONGBAO
app.get('/api/notifications', (req, res) => {
    db.query('SELECT * FROM THONGBAO', (err, results) => {
        if (err) {
            res.status(500).send('Lỗi khi truy vấn cơ sở dữ liệu.');
        } else {
            res.json(results);
        }
    });
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
