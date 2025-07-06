CREATE DATABASE QuanLyPhongTro;
USE QuanLyPhongTro;


CREATE TABLE NGUOIDUNG (
    MaNguoiDung INT AUTO_INCREMENT PRIMARY KEY,
    CCCD VARCHAR(12) UNIQUE NOT NULL,
    TenDangNhap VARCHAR(50) NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    Email VARCHAR(100),
    SoDienThoai VARCHAR(15),
    HoTen VARCHAR(100),
    VaiTro ENUM('admin','chunha','nguoithue'),
    TrangThai ENUM('hoatdong','khonghoatdong','biKhoa'),
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PHONG (
    MaPhong VARCHAR(10) PRIMARY KEY,
    MaChuNha INT,
    TieuDe VARCHAR(255),
    MoTa TEXT,
    URLAnhPhong VARCHAR(255),
    DienTich FLOAT,
    GiaThue DECIMAL(10,2),
    TrangThai ENUM('dangChoDuyet','daDuyet','dangThue','conTrong'),
    DiaChi VARCHAR(255),
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (MaChuNha) REFERENCES NGUOIDUNG(MaNguoiDung)
);

CREATE TABLE PHONG_CHO_DUYET (
    MaPhongChoDuyet INT AUTO_INCREMENT PRIMARY KEY,
    MaPhong VARCHAR(10),
    MaChuNha INT,
    TieuDe VARCHAR(255),
    MoTa TEXT,
    URLAnhPhong VARCHAR(255),
    DienTich FLOAT,
    GiaThue DECIMAL(10,2),
    DiaChi VARCHAR(255),
    NgayTao DATE,
    FOREIGN KEY (MaPhong) REFERENCES PHONG(MaPhong),
    FOREIGN KEY (MaChuNha) REFERENCES NGUOIDUNG(MaNguoiDung)
);

CREATE TABLE HOPDONG (
    MaHopDong INT AUTO_INCREMENT PRIMARY KEY,
    MaPhong VARCHAR(10),
    MaNguoiThue INT,
    NgayBatDau DATE,
    NgayKetThuc DATE,
    TienDatCoc DECIMAL(10,2),
    TrangThai ENUM('choDuyet','dangThue','daKetThuc','biHuy'),
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaPhong) REFERENCES PHONG(MaPhong),
    FOREIGN KEY (MaNguoiThue) REFERENCES NGUOIDUNG(MaNguoiDung)
);

CREATE TABLE THANHTOAN (
    MaThanhToan INT AUTO_INCREMENT PRIMARY KEY,
    MaHopDong INT,
    NgayThanhToan DATE,
    SoTien DECIMAL(10,2),
    PhuongThucThanhToan VARCHAR(50),
    TrangThai ENUM('daThanhToan','chuaThanhToan'),
    FOREIGN KEY (MaHopDong) REFERENCES HOPDONG(MaHopDong)
);

CREATE TABLE PHANHOI (
    MaPhanHoi INT AUTO_INCREMENT PRIMARY KEY,
    MaPhong VARCHAR(10),
    MaNguoiThue INT,
    DiemDanhGia INT,
    BinhLuan TEXT,
    NgayGui TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaPhong) REFERENCES PHONG(MaPhong),
    FOREIGN KEY (MaNguoiThue) REFERENCES NGUOIDUNG(MaNguoiDung)
);

CREATE TABLE THONGBAO (
    MaThongBao INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT,
    NoiDung TEXT,
    TrangThaiDoc BOOLEAN,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaNguoiDung) REFERENCES NGUOIDUNG(MaNguoiDung)
);


DESCRIBE NGUOIDUNG;
DESCRIBE PHONG;
DESCRIBE PHONG_CHO_DUYET;
DESCRIBE HOPDONG;
DESCRIBE THANHTOAN;
DESCRIBE PHANHOI;
DESCRIBE THONGBAO;


INSERT INTO NGUOIDUNG (CCCD, TenDangNhap, MatKhau, Email, SoDienThoai, HoTen, VaiTro, TrangThai) VALUES
('000000000001', 'admin', 'admin', 'admin@email.com', '0912000001', 'Quản Trị Viên', 'admin', 'hoatdong'),
('001234567890', 'an.nguyen', 'matkhau1', 'an.nguyen@email.com', '0912345001', 'Nguyễn Văn An', 'chunha', 'hoatdong'),
('002345678901', 'binh.tran', 'matkhau2', 'binh.tran@email.com', '0912345002', 'Trần Thị Bình', 'chunha', 'hoatdong'),
('003456789012', 'cuong.le', 'matkhau3', 'cuong.le@email.com', '0912345003', 'Lê Văn Cường', 'nguoithue', 'hoatdong'),
('004567890123', 'dung.do', 'matkhau4', 'dung.do@email.com', '0912345004', 'Đỗ Minh Dũng', 'nguoithue', 'hoatdong'),
('005678901234', 'hoa.dang', 'matkhau5', 'hoa.dang@email.com', '0912345005', 'Đặng Quang Hòa', 'nguoithue', 'hoatdong'),
('006789012345', 'ha.nguyen', 'matkhau6', 'ha.nguyen@email.com', '0912345006', 'Nguyễn Thị Hà', 'chunha', 'hoatdong'),
('007890123456', 'kien.pham', 'matkhau7', 'kien.pham@email.com', '0912345007', 'Phạm Văn Kiên', 'nguoithue', 'hoatdong'),
('008901234567', 'lan.trinh', 'matkhau8', 'lan.trinh@email.com', '0912345008', 'Trịnh Thị Lan', 'nguoithue', 'hoatdong'),
('009012345678', 'minh.vo', 'matkhau9', 'minh.vo@email.com', '0912345009', 'Võ Minh Quân', 'chunha', 'hoatdong'),
('010123456789', 'nhan.bui', 'matkhau10', 'nhan.bui@email.com', '0912345010', 'Bùi Quốc Nhân', 'nguoithue', 'hoatdong'),
('011234567891', 'phuc.le', 'matkhau11', 'phuc.le@email.com', '0912345011', 'Lê Văn Phúc', 'nguoithue', 'hoatdong'),
('012345678912', 'quyen.ly', 'matkhau12', 'quyen.ly@email.com', '0912345012', 'Lý Thị Quyên', 'chunha', 'hoatdong'),
('013456789123', 'son.phan', 'matkhau13', 'son.phan@email.com', '0912345013', 'Phan Ngọc Sơn', 'chunha', 'hoatdong'),
('014567891234', 'thao.tran', 'matkhau14', 'thao.tran@email.com', '0912345014', 'Trần Thị Thảo', 'nguoithue', 'hoatdong'),
('015678912345', 'vy.nguyen', 'matkhau15', 'vy.nguyen@email.com', '0912345015', 'Nguyễn Ngọc Vy', 'nguoithue', 'hoatdong'),
('016789123456', 'quang.pham', 'matkhau16', 'quang.pham@email.com', '0912345016', 'Phạm Quang Huy', 'chunha', 'hoatdong'),
('017891234567', 'trang.do', 'matkhau17', 'trang.do@email.com', '0912345017', 'Đỗ Thị Trang', 'nguoithue', 'hoatdong'),
('018912345678', 'bao.le', 'matkhau18', 'bao.le@email.com', '0912345018', 'Lê Bảo Minh', 'nguoithue', 'hoatdong'),
('019123456789', 'yennhi.tran', 'matkhau19', 'yennhi.tran@email.com', '0912345019', 'Trần Yến Nhi', 'chunha', 'hoatdong');

INSERT INTO PHONG (MaPhong, MaChuNha, TieuDe, MoTa, URLAnhPhong, DienTich, GiaThue, TrangThai, DiaChi) VALUES
('CT0001', 2, 'Huyện Hoài Đức', 'Phòng đẹp, thoáng mát', '/img/houses/ct0001.jpg', 20, 4650000, 'conTrong', 'Di Ái, Xã Di Trạch, Huyện Hoài Đức, Hà Nội'),
('CT0002', 3, 'Quận Bắc Từ Liêm', 'Phòng tiện nghi, rộng rãi', '/img/houses/ct0002.jpg', 22, 4450000, 'conTrong', '12 đường Cầu Diễn, Phường Minh Khai, Quận Bắc Từ Liêm, Hà Nội'),
('CT0003', 2, 'Quận Nam Từ Liêm', 'Phòng gần trung tâm', '/img/houses/ct0003.jpg', 25, 5750000, 'conTrong', 'Đình Thôn, Phường Mỹ Đình 1, Quận Nam Từ Liêm, Hà Nội'),
('CT0004', 3, 'Quận Bắc Từ Liêm', 'Phòng có ban công', '/img/houses/ct0004.jpg', 24, 4750000, 'conTrong', 'Cầu Diễn, Phường Minh Khai, Quận Bắc Từ Liêm, Hà Nội'),
('CT0005', 2, 'Quận Bắc Từ Liêm', 'Phòng đầy đủ tiện nghi', '/img/houses/ct0005.jpg', 20, 4050000, 'conTrong', 'Cầu Diễn, Phường Phúc Diễn, Quận Bắc Từ Liêm, Hà Nội'),
('CT0006', 7, 'Quận Thanh Xuân', 'Phòng view đẹp, có điều hòa', '/img/houses/ct0006.png', 30, 7650000, 'conTrong', '111 Nguyễn Xiển, Phường Hạ Đình, Quận Thanh Xuân, Hà Nội'),
('CT0007', 2, 'Quận Bắc Từ Liêm', 'Phòng nhiều ánh sáng', '/img/houses/ct0007.jpg', 21, 4150000, 'conTrong', 'Cầu Diễn, Phường Phúc Diễn, Quận Bắc Từ Liêm, Hà Nội'),
('CT0008', 3, 'Huyện Thanh Trì', 'Phòng mới xây', '/img/houses/ct0008.jpg', 20, 4950000, 'conTrong', 'Tân Triều, Xã Tân Triều, Huyện Thanh Trì, Hà Nội'),
('CT0009', 10, 'Quận Tây Hồ', 'Phòng tiện nghi, sạch sẽ', '/img/houses/ct0009.jpg', 22, 6650000, 'conTrong', 'Phường Nhật Tân, Quận Tây Hồ, Hà Nội'),
('CT0010', 17, 'Huyện Hoài Đức', 'Phòng giá rẻ, rộng rãi', '/img/houses/ct0010.jpg', 18, 3450000, 'conTrong', 'Lai Xá, Xã Di Trạch, Huyện Hoài Đức, Hà Nội'),
('CT0011', 2, 'Huyện Thanh Trì', 'Phòng tầng cao, có thang máy', '/img/houses/ct0011.jpg', 25, 5150000, 'conTrong', 'Yên Xá, Xã Tân Triều, Huyện Thanh Trì, Hà Nội'),
('CT0012', 14, 'Quận Nam Từ Liêm', 'Phòng 2 mặt thoáng', '/img/houses/ct0012.jpg', 26, 5450000, 'conTrong', 'Miếu Đầm, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội'),
('CT0013', 10, 'Quận Nam Từ Liêm', 'Phòng gần sân vận động Mỹ Đình', '/img/houses/ct0013.png', 28, 5350000, 'conTrong', 'Miếu Đầm, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội'),
('CT0014', 20, 'Quận Bắc Từ Liêm', 'Phòng tầng trệt, có sân', '/img/houses/ct0014.jpg', 27, 4750000, 'conTrong', 'Phú Diễn, Phường Phú Diễn, Quận Bắc Từ Liêm, Hà Nội'),
('CT0015', 15, 'Quận Hà Đông', 'Phòng đẹp, giá rẻ', '/img/houses/ct0015.jpg', 23, 3550000, 'conTrong', '35 Ngô Thì Sĩ, Phường Vạn Phúc, Quận Hà Đông, Hà Nội'),
('CT0016', 19, 'Quận Hoàng Mai', 'Phòng hướng Nam, thoáng mát', '/img/houses/ct0016.jpg', 22, 4150000, 'conTrong', 'Tam Trinh tổ 17, Phường Yên Sở, Quận Hoàng Mai, Hà Nội'),
('CT0017', 13, 'Quận Nam Từ Liêm', 'Phòng rộng, có ban công', '/img/houses/ct0017.jpg', 24, 5050000, 'conTrong', 'Phú Đô, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội'),
('CT0018', 11, 'Quận Bắc Từ Liêm', 'Phòng đẹp, yên tĩnh', '/img/houses/ct0018.jpeg', 21, 6550000, 'conTrong', '59 Văn Tiến Dũng, Phường Phúc Diễn, Quận Bắc Từ Liêm, Hà Nội'),
('CT0019', 17, 'Huyện Thanh Trì', 'Phòng tầng 3, có view đẹp', '/img/houses/ct0019.jpg', 22, 4450000, 'conTrong', 'Đường Kim Giang, Thôn Nội, Xã Thanh Liệt, Huyện Thanh Trì, Hà Nội'),
('CT0020', 20, 'Huyện Thanh Trì', 'Phòng giá hợp lý', '/img/houses/ct0020.jpg', 22, 4650000, 'conTrong', 'Khu Đấu Giá Yên Xá, Xã Tân Triều, Huyện Thanh Trì, Hà Nội');

INSERT INTO HOPDONG (MaPhong, MaNguoiThue, NgayBatDau, NgayKetThuc, TienDatCoc, TrangThai) VALUES
('CT0001', 4, '2023-06-01', '2023-12-01', 1000000, 'dangThue'),
('CT0002', 5, '2023-06-10', '2023-12-10', 1200000, 'dangThue'),
('CT0003', 6, '2023-06-15', '2023-12-15', 1500000, 'choDuyet'),
('CT0004', 7, '2023-07-01', '2023-12-01', 2000000, 'dangThue'),
('CT0005', 8, '2023-07-05', '2023-12-05', 1000000, 'dangThue'),
('CT0006', 9, '2023-07-10', '2023-12-10', 1100000, 'choDuyet'),
('CT0007', 10, '2023-07-15', '2023-12-15', 1300000, 'dangThue'),
('CT0008', 4, '2023-08-01', '2023-12-01', 1400000, 'dangThue'),
('CT0009', 5, '2023-08-05', '2023-12-05', 1500000, 'dangThue'),
('CT0010', 6, '2023-08-10', '2023-12-10', 1600000, 'choDuyet'),
('CT0011', 7, '2023-08-15', '2023-12-15', 1700000, 'dangThue'),
('CT0012', 8, '2023-08-20', '2023-12-20', 1800000, 'dangThue'),
('CT0013', 9, '2023-08-25', '2023-12-25', 1900000, 'choDuyet'),
('CT0014', 10, '2023-09-01', '2023-12-01', 2000000, 'dangThue'),
('CT0015', 4, '2023-09-05', '2023-12-05', 2100000, 'dangThue'),
('CT0016', 5, '2023-09-10', '2023-12-10', 2200000, 'choDuyet'),
('CT0017', 6, '2023-09-15', '2023-12-15', 2300000, 'dangThue'),
('CT0018', 7, '2023-09-20', '2023-12-20', 2400000, 'dangThue'),
('CT0019', 8, '2023-09-25', '2023-12-25', 2500000, 'choDuyet'),
('CT0020', 9, '2023-10-01', '2023-12-01', 2600000, 'dangThue');

INSERT INTO THANHTOAN (MaHopDong, NgayThanhToan, SoTien, PhuongThucThanhToan, TrangThai) VALUES
(1, '2023-06-01', 4650000, 'Chuyển khoản', 'daThanhToan'),
(2, '2023-06-10', 5500000, 'Tiền mặt', 'chuaThanhToan'),
(3, '2023-06-15', 8500000, 'Chuyển khoản', 'daThanhToan'),
(4, '2023-07-01', 6500000, 'Chuyển khoản', 'chuaThanhToan'),
(5, '2023-07-05', 7000000, 'Tiền mặt', 'daThanhToan'),
(6, '2023-07-10', 7200000, 'Chuyển khoản', 'chuaThanhToan'),
(7, '2023-07-15', 7400000, 'Chuyển khoản', 'daThanhToan'),
(8, '2023-08-01', 7500000, 'Tiền mặt', 'chuaThanhToan'),
(9, '2023-08-05', 7600000, 'Chuyển khoản', 'daThanhToan'),
(10, '2023-08-10', 7700000, 'Tiền mặt', 'chuaThanhToan'),
(11, '2023-08-15', 7800000, 'Chuyển khoản', 'daThanhToan'),
(12, '2023-08-20', 7900000, 'Tiền mặt', 'chuaThanhToan'),
(13, '2023-08-25', 8000000, 'Chuyển khoản', 'daThanhToan'),
(14, '2023-09-01', 8100000, 'Chuyển khoản', 'chuaThanhToan'),
(15, '2023-09-05', 8200000, 'Tiền mặt', 'daThanhToan'),
(16, '2023-09-10', 8300000, 'Chuyển khoản', 'chuaThanhToan'),
(17, '2023-09-15', 8400000, 'Chuyển khoản', 'daThanhToan'),
(18, '2023-09-20', 8500000, 'Tiền mặt', 'chuaThanhToan'),
(19, '2023-09-25', 8600000, 'Chuyển khoản', 'daThanhToan'),
(20, '2023-10-01', 8700000, 'Tiền mặt', 'chuaThanhToan');

INSERT INTO PHANHOI (MaPhong, MaNguoiThue, DiemDanhGia, BinhLuan) VALUES
('CT0001', 4, 5, 'Phòng rất đẹp và tiện nghi, chủ nhà thân thiện.'),
('CT0002', 5, 4, 'Phòng đẹp nhưng có hơi ồn ào vào buổi tối.'),
('CT0003', 6, 4, 'Phòng sạch sẽ, đầy đủ tiện nghi, giá cả hợp lý.'),
('CT0004', 7, 3, 'Phòng hơi nhỏ và thiếu ánh sáng tự nhiên.'),
('CT0005', 8, 5, 'Phòng rất rộng và thoáng, vị trí tuyệt vời.'),
('CT0006', 9, 4, 'Phòng đẹp nhưng không gian hơi chật.'),
('CT0007', 10, 5, 'Phòng rộng rãi, sạch sẽ, thoải mái.'),
('CT0008', 4, 4, 'Phòng có view đẹp, giá hợp lý nhưng thiếu tiện nghi.'),
('CT0009', 5, 5, 'Phòng tiện nghi đầy đủ, gần các tiện ích.'),
('CT0010', 6, 4, 'Phòng yên tĩnh, sạch sẽ, tuy nhiên không có thang máy.'),
('CT0011', 7, 4, 'Phòng đẹp, giá hợp lý nhưng thiếu ánh sáng tự nhiên.'),
('CT0012', 8, 5, 'Phòng rất đẹp và thoải mái, đầy đủ tiện nghi.'),
('CT0013', 9, 3, 'Phòng hơi nhỏ, khu vực có tiếng ồn nhiều.'),
('CT0014', 10, 5, 'Phòng rộng, không gian thoáng đãng và rất yên tĩnh.'),
('CT0015', 4, 5, 'Phòng rất thoải mái, tiện nghi đầy đủ.'),
('CT0016', 5, 4, 'Phòng rộng nhưng giá hơi cao so với các khu vực khác.'),
('CT0017', 6, 5, 'Phòng đẹp, rất thoải mái và an ninh tốt.'),
('CT0018', 7, 3, 'Phòng khá nhỏ và ít tiện nghi.'),
('CT0019', 8, 5, 'Phòng rất thoải mái, gần trung tâm.'),
('CT0020', 9, 4, 'Phòng sạch sẽ, giá hợp lý nhưng thiếu thang máy.');

INSERT INTO THONGBAO (MaNguoiDung, NoiDung, TrangThaiDoc) VALUES
(4, 'Chào bạn, phòng của bạn đã được duyệt và có thể cho thuê.', FALSE),
(5, 'Phòng của bạn đã được xác nhận và sẽ có người thuê trong tuần này.', TRUE),
(6, 'Chúng tôi đã nhận được yêu cầu thuê phòng của bạn và sẽ xác nhận trong 24 giờ.', FALSE),
(7, 'Phòng của bạn đã được đặt thuê thành công.', TRUE),
(8, 'Thông báo về việc gia hạn hợp đồng cho thuê phòng của bạn.', FALSE),
(9, 'Phòng của bạn đã bị hủy yêu cầu thuê. Vui lòng kiểm tra lại.', TRUE),
(10, 'Chúng tôi đã cập nhật thông tin thuê phòng mới của bạn.', FALSE),
(4, 'Cảm ơn bạn đã thanh toán cho thuê phòng. Hợp đồng sẽ được cập nhật.', TRUE),
(5, 'Phòng của bạn đang chờ duyệt, sẽ có thông báo sau khi xem xét.', FALSE),
(6, 'Thông báo về việc thay đổi giá thuê phòng của bạn.', FALSE),
(7, 'Chúng tôi cần bạn cung cấp thêm thông tin để hoàn thành hợp đồng thuê.', TRUE),
(8, 'Phòng của bạn đã được duyệt và sẵn sàng cho thuê.', TRUE),
(9, 'Chúng tôi đã nhận được phản hồi của bạn, vui lòng kiểm tra lại hợp đồng.', FALSE),
(10, 'Phòng của bạn đã được thỏa thuận xong và chờ ngày ký hợp đồng.', TRUE),
(4, 'Thông báo về việc thay đổi điều kiện cho thuê phòng.', FALSE),
(5, 'Đã nhận được thanh toán từ người thuê phòng của bạn.', TRUE),
(6, 'Phòng của bạn hiện đang được thuê, vui lòng kiểm tra hợp đồng chi tiết.', TRUE),
(7, 'Vui lòng kiểm tra lại thông tin phòng, hợp đồng sẽ được gia hạn.', FALSE),
(8, 'Thông báo về việc đóng cửa phòng cho thuê trong thời gian tới.', TRUE),
(9, 'Chúng tôi đã gửi thông báo cho người thuê về phòng của bạn. Hợp đồng đã được ký.', TRUE);


-- 5 CÂU LỆNH TRUY VẤN
-- 1. Thêm một người dùng mới vào bảng NGUOIDUNG
INSERT INTO NGUOIDUNG (CCCD, TenDangNhap, MatKhau, Email, SoDienThoai, HoTen, VaiTro, TrangThai)
VALUES ('022233344455', 'lam.nguyen', '123456', 'lam.nguyen@email.com', '0912555666', 'Nguyễn Văn Lâm', 'nguoithue', 'hoatdong');

-- 2. Thêm một phòng mới vào bảng PHONG
INSERT INTO PHONG (MaPhong, MaChuNha, TieuDe, MoTa, URLAnhPhong, DienTich, GiaThue, TrangThai, DiaChi)
VALUES ('CT0021', 2, 'Quận Hai Bà Trưng', 'Phòng mới, có ban công', './assets/img/houses/ct0021.jpg', 22,
 5000000, 'conTrong', '123 Bạch Mai, Quận Hai Bà Trưng, Hà Nội');

-- 3. Thêm hợp đồng thuê phòng mới vào bảng HOPDONG
INSERT INTO HOPDONG (MaPhong, MaNguoiThue, NgayBatDau, NgayKetThuc, TienDatCoc, TrangThai)
VALUES ('CT0021', 11, '2024-06-21', '2024-12-21', 2000000, 'dangThue');

-- 4. Thêm một giao dịch thanh toán mới vào bảng THANHTOAN
INSERT INTO THANHTOAN (MaHopDong, NgayThanhToan, SoTien, PhuongThucThanhToan, TrangThai)
VALUES (21, '2024-06-22', 5000000, 'Chuyển khoản', 'daThanhToan');

-- 5. Thêm một phản hồi mới vào bảng PHANHOI
INSERT INTO PHANHOI (MaPhong, MaNguoiThue, DiemDanhGia, BinhLuan)
VALUES ('CT0021', 11, 5, 'Phòng đẹp, vị trí thuận tiện, chủ nhà nhiệt tình.');

-- 1. Xóa người dùng có tên đăng nhập là 'lam.nguyen'
DELETE FROM NGUOIDUNG WHERE TenDangNhap = 'lam.nguyen';

-- 2. Xóa phòng trọ có mã phòng là 'CT0021'
DELETE FROM PHONG WHERE MaPhong = 'CT0021';

-- 3. Xóa hợp đồng thuê phòng có mã hợp đồng là 21
DELETE FROM HOPDONG WHERE MaHopDong = 21;

-- 4. Xóa giao dịch thanh toán có mã thanh toán là 25
DELETE FROM THANHTOAN WHERE MaThanhToan = 25;

-- 5. Xóa phản hồi có mã phòng là 'CT0021' và mã người thuê là 11
DELETE FROM PHANHOI WHERE MaPhong = 'CT0021' AND MaNguoiThue = 11;

-- 1. Cập nhật email của người dùng có tên đăng nhập là 'lam.nguyen'
UPDATE NGUOIDUNG
SET Email = 'lam.nguyen_updated@email.com'
WHERE TenDangNhap = 'lam.nguyen';

-- 2. Cập nhật giá thuê của phòng 'CT0021' thành 5.500.000 VNĐ
UPDATE PHONG
SET GiaThue = 5500000
WHERE MaPhong = 'CT0021';

-- 3. Cập nhật trạng thái hợp đồng mã 21 thành 'daKetThuc'
UPDATE HOPDONG
SET TrangThai = 'daKetThuc'
WHERE MaHopDong = 21;

-- 4. Đánh dấu giao dịch thanh toán mã 25 đã thanh toán
UPDATE THANHTOAN
SET TrangThai = 'daThanhToan'
WHERE MaThanhToan = 25;

-- 5. Sửa lại nội dung phản hồi của người thuê mã 11 cho phòng 'CT0021'
UPDATE PHANHOI
SET BinhLuan = 'Dịch vụ phòng rất tốt, chủ nhà hỗ trợ nhiệt tình.'
WHERE MaPhong = 'CT0021' AND MaNguoiThue = 11;

-- 1. Lấy tất cả thông tin người dùng có vai trò là 'chunha'
SELECT * FROM NGUOIDUNG WHERE VaiTro = 'chunha';

-- 2. Lấy danh sách các phòng còn trống tại quận Bắc Từ Liêm
SELECT * FROM PHONG;

-- 3. Lấy tất cả hợp đồng đang thuê của người dùng có mã là 4
SELECT * FROM HOPDONG
WHERE MaNguoiThue = 4 AND TrangThai = 'dangThue';

-- 4. Lấy thông tin thanh toán đã hoàn thành của phòng 'CT0005'
SELECT t.*
FROM THANHTOAN t
JOIN HOPDONG h ON t.MaHopDong = h.MaHopDong
WHERE h.MaPhong = 'CT0005' AND t.TrangThai = 'daThanhToan';

-- 5. Lấy các phản hồi đánh giá 5 sao cho phòng có mã 'CT0015'
SELECT * FROM PHANHOI
WHERE MaPhong = 'CT0015' AND DiemDanhGia = 5;

-- 1. Lấy danh sách phòng và tên chủ nhà cho mỗi phòng
SELECT p.MaPhong, p.TieuDe, p.DiaChi, n.HoTen AS TenChuNha
FROM PHONG p
JOIN NGUOIDUNG n ON p.MaChuNha = n.MaNguoiDung;

-- 2. Lấy thông tin hợp đồng và tên người thuê tương ứng
SELECT h.MaHopDong, h.MaPhong, h.NgayBatDau, h.NgayKetThuc, n.HoTen AS TenNguoiThue
FROM HOPDONG h
JOIN NGUOIDUNG n ON h.MaNguoiThue = n.MaNguoiDung;

-- 3. Liệt kê các giao dịch thanh toán kèm mã phòng tương ứng
SELECT t.MaThanhToan, t.NgayThanhToan, t.SoTien, h.MaPhong
FROM THANHTOAN t
JOIN HOPDONG h ON t.MaHopDong = h.MaHopDong;

-- 4. Lấy danh sách phản hồi kèm địa chỉ phòng phản hồi
SELECT f.MaPhanHoi, f.DiemDanhGia, f.BinhLuan, p.DiaChi
FROM PHANHOI f
JOIN PHONG p ON f.MaPhong = p.MaPhong;

-- 5. Lấy thông báo và tên người dùng nhận thông báo
SELECT tb.MaThongBao, tb.NoiDung, n.HoTen
FROM THONGBAO tb
JOIN NGUOIDUNG n ON tb.MaNguoiDung = n.MaNguoiDung;

-- 1. Lấy danh sách các giao dịch thanh toán kèm tên phòng và tên người thuê
SELECT t.MaThanhToan, t.NgayThanhToan, t.SoTien, p.MaPhong, p.TieuDe, n.HoTen AS TenNguoiThue
FROM THANHTOAN t
JOIN HOPDONG h ON t.MaHopDong = h.MaHopDong
JOIN PHONG p ON h.MaPhong = p.MaPhong
JOIN NGUOIDUNG n ON h.MaNguoiThue = n.MaNguoiDung;

-- 2. Liệt kê các phản hồi của từng người thuê với thông tin phòng và chủ nhà
SELECT f.MaPhanHoi, f.BinhLuan, f.DiemDanhGia, p.TieuDe AS TenPhong, n.HoTen AS TenNguoiThue, c.HoTen AS TenChuNha
FROM PHANHOI f
JOIN PHONG p ON f.MaPhong = p.MaPhong
JOIN NGUOIDUNG n ON f.MaNguoiThue = n.MaNguoiDung
JOIN NGUOIDUNG c ON p.MaChuNha = c.MaNguoiDung;

-- 3. Lấy danh sách hợp đồng đang thuê, tên phòng và chủ nhà
SELECT h.MaHopDong, p.MaPhong, p.TieuDe, c.HoTen AS TenChuNha, n.HoTen AS TenNguoiThue
FROM HOPDONG h
JOIN PHONG p ON h.MaPhong = p.MaPhong
JOIN NGUOIDUNG n ON h.MaNguoiThue = n.MaNguoiDung
JOIN NGUOIDUNG c ON p.MaChuNha = c.MaNguoiDung
WHERE h.TrangThai = 'dangThue';

-- 4. Lấy danh sách các hợp đồng có thanh toán chưa hoàn thành, kèm tên người thuê và phòng
SELECT h.MaHopDong, p.MaPhong, p.TieuDe, n.HoTen AS TenNguoiThue, t.TrangThai
FROM HOPDONG h
JOIN PHONG p ON h.MaPhong = p.MaPhong
JOIN NGUOIDUNG n ON h.MaNguoiThue = n.MaNguoiDung
JOIN THANHTOAN t ON h.MaHopDong = t.MaHopDong
WHERE t.TrangThai = 'chuaThanhToan';

-- 5. Lấy danh sách các thông báo gửi cho người thuê kèm mã phòng đang thuê của họ
SELECT tb.MaThongBao, tb.NoiDung, n.HoTen AS TenNguoiThue, h.MaPhong
FROM THONGBAO tb
JOIN NGUOIDUNG n ON tb.MaNguoiDung = n.MaNguoiDung
JOIN HOPDONG h ON n.MaNguoiDung = h.MaNguoiThue;

-- 1. Đếm số lượng phòng do từng chủ nhà quản lý, chỉ lấy các chủ nhà có từ 2 phòng trở lên
SELECT MaChuNha, COUNT(*) AS SoLuongPhong
FROM PHONG
GROUP BY MaChuNha
HAVING COUNT(*) >= 2;

-- 2. Đếm số hợp đồng của từng người thuê, chỉ hiển thị các người thuê có nhiều hơn 1 hợp đồng
SELECT MaNguoiThue, COUNT(*) AS SoHopDong
FROM HOPDONG
GROUP BY MaNguoiThue
HAVING COUNT(*) > 1;

-- 3. Tính tổng số tiền thanh toán của từng phương thức, chỉ hiển thị phương thức có tổng lớn hơn 50 triệu
SELECT PhuongThucThanhToan, SUM(SoTien) AS TongThanhToan
FROM THANHTOAN
GROUP BY PhuongThucThanhToan
HAVING SUM(SoTien) > 50000000;

-- 4. Đếm số lượng phản hồi đánh giá theo từng điểm đánh giá, chỉ lấy các điểm được đánh giá từ 2 lần trở lên
SELECT DiemDanhGia, COUNT(*) AS SoLuongPhanHoi
FROM PHANHOI
GROUP BY DiemDanhGia
HAVING COUNT(*) >= 2;

-- 5. Đếm số hợp đồng theo trạng thái, chỉ lấy những trạng thái có nhiều hơn 3 hợp đồng
SELECT TrangThai, COUNT(*) AS SoHopDong
FROM HOPDONG
GROUP BY TrangThai
HAVING COUNT(*) > 3;

SELECT 
COUNT(*) as totalUsers,
SUM(CASE WHEN VaiTro = 'admin' THEN 1 ELSE 0 END) as totalAdmins,
SUM(CASE WHEN VaiTro = 'chunha' THEN 1 ELSE 0 END) as totalLandlords,
SUM(CASE WHEN VaiTro = 'nguoithue' THEN 1 ELSE 0 END) as totalTenants,
SUM(CASE WHEN TrangThai = 'hoatdong' THEN 1 ELSE 0 END) as activeUsers,
SUM(CASE WHEN TrangThai = 'khonghoatdong' THEN 1 ELSE 0 END) as inactiveUsers,
SUM(CASE WHEN TrangThai = 'biKhoa' THEN 1 ELSE 0 END) as blockedUsers
FROM NGUOIDUNG;

SELECT p.*, n.HoTen as TenChuNha, n.Email as EmailChuNha, n.SoDienThoai as SoDienThoaiChuNha
FROM PHONG p
LEFT JOIN NGUOIDUNG n ON p.MaChuNha = n.MaNguoiDung
ORDER BY p.NgayTao DESC;

SELECT p.*, n.HoTen as TenChuNha, n.Email as EmailChuNha, n.SoDienThoai as SoDienThoaiChuNha
                FROM PHONG p
                LEFT JOIN NGUOIDUNG n ON p.MaChuNha = n.MaNguoiDung
                WHERE 1=1;