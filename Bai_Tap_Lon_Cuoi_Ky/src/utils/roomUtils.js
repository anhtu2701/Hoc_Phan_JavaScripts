const fs = require('fs');
const path = require('path');


let isGeneratingCode = false;
let codeQueue = [];

// Tạo mã phòng tiếp theo
function getNextRoomCode() {
    const housesDir = path.join(__dirname, '../public/img/houses');
    
    try {
        // Lấy danh sách file ảnh
        const files = fs.readdirSync(housesDir);
        const roomCodes = files
            .filter(file => file.match(/^ct\d{4}\./)) 
            .map(file => {
                const match = file.match(/^ct(\d{4})\./);
                return match ? parseInt(match[1]) : 0;
            })
            .sort((a, b) => b - a);

        // Lấy mã cao nhất và tăng lên 1
        const nextCode = roomCodes.length > 0 ? roomCodes[0] + 1 : 1;
        return `ct${nextCode.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error('Error getting next room code:', error);
        return 'ct0001'; 
    }
}

// Move ảnh từ temp sang houses
function moveImageFromTemp(tempFilename, roomCode) {
    try {
        const tempDir = path.join(__dirname, '../public/uploads/temp');
        const housesDir = path.join(__dirname, '../public/img/houses');

        // Tạo houses directory nếu chưa có
        if (!fs.existsSync(housesDir)) {
            fs.mkdirSync(housesDir, { recursive: true });
        }

        const tempFilePath = path.join(tempDir, tempFilename);
        const ext = path.extname(tempFilename); 
        const newFileName = `${roomCode}${ext}`;
        const newFilePath = path.join(housesDir, newFileName);

        // Check file temp có tồn tại không
        if (!fs.existsSync(tempFilePath)) {
            const tempFiles = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];
            
            return {
                success: false,
                error: `File temp không tồn tại: ${tempFilePath}. Files in temp: ${tempFiles.join(', ')}`
            };
        }

        // chuyen temp sang houses
        fs.renameSync(tempFilePath, newFilePath);

        return {
            success: true,
            filename: newFileName,
            path: newFilePath,
            url: `/img/houses/${newFileName}`
        };
    } catch (error) {
        console.error('Lỗi di chuyển ảnh từ temp sang houses:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Xóa ảnh từ temp
function deleteTempImage(tempFilename) {
    try {
        if (!tempFilename) {
            return { success: true, message: 'Không có ảnh để xóa' };
        }

        const tempDir = path.join(__dirname, '../public/uploads/temp');
        const tempFilePath = path.join(tempDir, tempFilename);

        // KIEEMR TRA FILE CO TON TAI KHONG
        if (!fs.existsSync(tempFilePath)) {
            return { success: true, message: 'File temp không tồn tại' };
        }

        // Xóa file
        fs.unlinkSync(tempFilePath);

        return {
            success: true,
            message: `Đã xóa ảnh ${tempFilename} thành công`
        };
    } catch (error) {
        console.error('Lỗi xóa ảnh từ temp:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Đổi tên file ảnh theo mã phòng
function renameImageFile(tempFilePath, roomCode) {
    try {
        const dir = path.dirname(tempFilePath);
        const ext = path.extname(tempFilePath);
        const newFileName = `${roomCode}${ext}`;
        const newFilePath = path.join(dir, newFileName);
        
        // Đổi tên file
        fs.renameSync(tempFilePath, newFilePath);
        
        return {
            success: true,
            filename: newFileName,
            path: newFilePath,
            url: `/img/houses/${newFileName}`
        };
    } catch (error) {
        console.error('Error renaming image file:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Xóa ảnh phòng theo imageURL
function deleteRoomImage(imageURL) {
    try {
        if (!imageURL || imageURL === '') {
            return { success: true, message: 'Không có ảnh để xóa' };
        }

        const filename = imageURL.replace('/img/houses/', '');
        
        // Tạo đường dẫn đầy đủ
        const fullPath = path.join(__dirname, '../public/img/houses', filename);
        
        // Kiểm tra file có tồn tại không
        if (!fs.existsSync(fullPath)) {
            return { success: true, message: 'File ảnh không tồn tại' };
        }

        // Xóa file
        fs.unlinkSync(fullPath);
        
        return {
            success: true,
            message: `Đã xóa ảnh ${filename} thành công`
        };
    } catch (error) {
        console.error('Lỗi xóa ảnh phòng:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    getNextRoomCode,
    renameImageFile,
    deleteRoomImage,
    moveImageFromTemp,
    deleteTempImage
};