-- Update schema for Rooms Management Feature
-- Thêm trạng thái 'ngungThue' vào ENUM TrangThai của bảng PHONG

ALTER TABLE PHONG 
MODIFY COLUMN TrangThai ENUM('conTrong', 'daThue', 'baoTri', 'ngungThue') DEFAULT 'conTrong';

-- Tạo bảng PHONG_CHO_DUYET cho tính năng phê duyệt phòng (nếu chưa có)
CREATE TABLE IF NOT EXISTS PHONG_CHO_DUYET (
    MaPhongChoDuyet VARCHAR(10) PRIMARY KEY,
    MaPhong VARCHAR(10),
    MaChuNha VARCHAR(10) NOT NULL,
    TieuDe VARCHAR(200) NOT NULL,
    MoTa TEXT,
    URLAnhPhong VARCHAR(500),
    DienTich DECIMAL(5,2) NOT NULL,
    GiaThue DECIMAL(10,0) NOT NULL,
    DiaChi VARCHAR(500) NOT NULL,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TrangThai ENUM('choDuyet', 'daDuyet', 'tuChoi') DEFAULT 'choDuyet',
    GhiChu TEXT,
    FOREIGN KEY (MaChuNha) REFERENCES NGUOIDUNG(MaNguoiDung) ON DELETE CASCADE
);

-- Thêm indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_phong_trangthai ON PHONG(TrangThai);
CREATE INDEX IF NOT EXISTS idx_phong_giathue ON PHONG(GiaThue);
CREATE INDEX IF NOT EXISTS idx_phong_dientich ON PHONG(DienTich);
CREATE INDEX IF NOT EXISTS idx_phong_chonha ON PHONG(MaChuNha);

-- Insert sample data cho testing (nếu cần)
-- INSERT INTO PHONG (MaPhong, MaChuNha, TieuDe, MoTa, URLAnhPhong, DienTich, GiaThue, TrangThai, DiaChi)
-- VALUES 
-- ('CT0021', 'ND001', 'Phòng test 1', 'Mô tả test', './assets/img/houses/default.jpg', 25.5, 3500000, 'conTrong', '123 Test Street'),
-- ('CT0022', 'ND001', 'Phòng test 2', 'Mô tả test 2', './assets/img/houses/default.jpg', 30.0, 4000000, 'daThue', '456 Test Avenue'); 