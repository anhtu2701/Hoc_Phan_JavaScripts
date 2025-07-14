const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../public/uploads/temp');
        
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Tạm thời lưu với tên gốc, sẽ đổi tên sau
        const tempName = `temp-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, tempName);
    }
});

// Lọc file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp)'));
    }
};

// Cấu hình multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
    fileFilter: fileFilter
});

module.exports = upload;