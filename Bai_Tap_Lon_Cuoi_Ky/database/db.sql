create	database quan_ly_phong_tro;
use quan_ly_phong_tro;

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

INSERT INTO NGUOIDUNG (CCCD, TenDangNhap, MatKhau, Email, SoDienThoai, HoTen, VaiTro, TrangThai)
VALUES
('001206014192', 'admin', 'admin', 'nguyenviet1@example.com', '0901234567', 'Nguyễn Văn A', 'admin', 'hoatdong'),
('012345678902', 'tranthi2', 'password456', 'tranthi2@example.com', '0902345678', 'Trần Thị B', 'chunha', 'hoatdong'),
('012345678903', 'lehoang3', 'password789', 'lehoang3@example.com', '0903456789', 'Lê Hoàng C', 'nguoithue', 'hoatdong'),
('012345678904', 'phamthao4', 'password101', 'phamthao4@example.com', '0904567890', 'Phạm Thảo D', 'nguoithue', 'khonghoatdong'),
('012345678905', 'ngoclan5', 'password202', 'ngoclan5@example.com', '0905678901', 'Ngô Lan E', 'chunha', 'hoatdong'),
('012345678906', 'hoangminh6', 'password303', 'hoangminh6@example.com', '0906789012', 'Hoàng Minh F', 'admin', 'hoatdong'),
('012345678907', 'duongquyen7', 'password404', 'duongquyen7@example.com', '0907890123', 'Dương Quyên G', 'nguoithue', 'biKhoa'),
('012345678908', 'nguyenthao8', 'password505', 'nguyenthao8@example.com', '0908901234', 'Nguyễn Thảo H', 'nguoithue', 'hoatdong'),
('012345678909', 'thuhien9', 'password606', 'thuhien9@example.com', '0909012345', 'Thùy Hiền I', 'chunha', 'hoatdong'),
('012345678910', 'quanghieu10', 'password707', 'quanghieu10@example.com', '0900123456', 'Quang Hiếu J', 'admin', 'hoatdong');

INSERT INTO NGUOIDUNG (CCCD, TenDangNhap, MatKhau, Email, SoDienThoai, HoTen, VaiTro, TrangThai)
VALUES
('012345678911', 'dangduong11', 'password808', 'dangduong11@example.com', '0900234567', 'Đặng Dương K', 'nguoithue', 'hoatdong'),
('012345678912', 'phuongthao12', 'password909', 'phuongthao12@example.com', '0900345678', 'Phương Thảo L', 'chunha', 'khonghoatdong'),
('012345678913', 'hieunam13', 'password010', 'hieunam13@example.com', '0900456789', 'Hiếu Nam M', 'nguoithue', 'hoatdong'),
('012345678914', 'thanhson14', 'password111', 'thanhson14@example.com', '0900567890', 'Thanh Sơn N', 'nguoithue', 'hoatdong'),
('012345678915', 'dungtuan15', 'password212', 'dungtuan15@example.com', '0900678901', 'Dũng Tuấn O', 'chunha', 'hoatdong'),
('012345678916', 'bichthu16', 'password313', 'bichthu16@example.com', '0900789012', 'Bích Thùy P', 'nguoithue', 'khonghoatdong'),
('012345678917', 'minhtrang17', 'password414', 'minhtrang17@example.com', '0900890123', 'Minh Trang Q', 'chunha', 'hoatdong'),
('012345678918', 'huyenngoc18', 'password515', 'huyenngoc18@example.com', '0900901234', 'Huyền Ngọc R', 'nguoithue', 'hoatdong'),
('012345678919', 'trantuan19', 'password616', 'trantuan19@example.com', '0901012345', 'Trần Tuấn S', 'nguoithue', 'biKhoa'),
('012345678920', 'anhthu20', 'password717', 'anhthu20@example.com', '0901123456', 'Anh Thư T', 'admin', 'hoatdong');

INSERT INTO PHONG (MaPhong, MaChuNha, TieuDe, MoTa, URLAnhPhong, DienTich, GiaThue, TrangThai, DiaChi)
VALUES
('CT0001', 1, 'Huyện Hoài Đức', 'Phòng đẹp, thoáng mát', './assets/img/houses/ct0001.jpg', 20, 4650000, 'conTrong', 'Di Ái, Xã Di Trạch, Huyện Hoài Đức, Hà Nội'),
('CT0002', 2, 'Quận Bắc Từ Liêm', 'Phòng tiện nghi, rộng rãi', './assets/img/houses/ct0002.jpg', 22, 4450000, 'conTrong', '12 đường Cầu Diễn, Phường Minh Khai, Quận Bắc Từ Liêm, Hà Nội'),
('CT0003', 3, 'Quận Nam Từ Liêm', 'Phòng gần trung tâm', './assets/img/houses/ct0003.jpg', 25, 5750000, 'conTrong', 'Đình Thôn, Phường Mỹ Đình 1, Quận Nam Từ Liêm, Hà Nội'),
('CT0004', 4, 'Quận Bắc Từ Liêm', 'Phòng có ban công', './assets/img/houses/ct0004.jpg', 24, 4750000, 'conTrong', 'Cầu Diễn, Phường Minh Khai, Quận Bắc Từ Liêm, Hà Nội'),
('CT0005', 5, 'Quận Bắc Từ Liêm', 'Phòng đầy đủ tiện nghi', './assets/img/houses/ct0005.jpg', 20, 4050000, 'conTrong', 'Cầu Diễn, Phường Phúc Diễn, Quận Bắc Từ Liêm, Hà Nội'),
('CT0006', 6, 'Quận Thanh Xuân', 'Phòng hiện đại', './assets/img/houses/ct0006.png', 28, 7650000, 'conTrong', '111 Nguyễn Xiển, Phường Hạ Đình, Quận Thanh Xuân, Hà Nội'),
('CT0007', 7, 'Quận Bắc Từ Liêm', 'Phòng yên tĩnh, gần công viên', './assets/img/houses/ct0007.jpg', 18, 4150000, 'conTrong', 'Cầu Diễn, Phường Phúc Diễn, Quận Bắc Từ Liêm, Hà Nội'),
('CT0008', 8, 'Huyện Thanh Trì', 'Phòng mới xây', './assets/img/houses/ct0008.jpg', 20, 4950000, 'conTrong', 'Tân Triều, Xã Tân Triều, Huyện Thanh Trì, Hà Nội'),
('CT0009', 9, 'Quận Tây Hồ', 'Phòng gần hồ', './assets/img/houses/ct0009.jpg', 30, 6650000, 'conTrong', 'Phường Nhật Tân, Quận Tây Hồ, Hà Nội'),
('CT0010', 10, 'Huyện Hoài Đức', 'Phòng rộng, thoáng', './assets/img/houses/ct0010.jpg', 25, 3450000, 'conTrong', 'Lai Xá, Xã Di Trạch, Huyện Hoài Đức, Hà Nội'),
('CT0011', 1, 'Huyện Thanh Trì', 'Phòng rộng rãi, đầy đủ tiện nghi', './assets/img/houses/ct0011.jpg', 22, 5150000, 'conTrong', 'Yên Xá, Xã Tân Triều, Huyện Thanh Trì, Hà Nội'),
('CT0012', 2, 'Quận Nam Từ Liêm', 'Phòng đẹp, trung tâm', './assets/img/houses/ct0012.jpg', 25, 5450000, 'conTrong', 'Miếu Đầm, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội'),
('CT0013', 3, 'Quận Nam Từ Liêm', 'Phòng tiện nghi', './assets/img/houses/ct0013.png', 27, 5350000, 'conTrong', 'Miếu Đầm, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội'),
('CT0014', 4, 'Quận Bắc Từ Liêm', 'Phòng gần trường học', './assets/img/houses/ct0014.jpg', 20, 4750000, 'conTrong', 'Phú Diễn, Phường Phú Diễn, Quận Bắc Từ Liêm, Hà Nội'),
('CT0015', 5, 'Quận Hà Đông', 'Phòng gần các tiện ích', './assets/img/houses/ct0015.jpg', 18, 3550000, 'conTrong', '35 Ngô Thì Sĩ, Phường Vạn Phúc, Quận Hà Đông, Hà Nội'),
('CT0016', 6, 'Quận Hoàng Mai', 'Phòng giá rẻ, sạch sẽ', './assets/img/houses/ct0016.jpg', 22, 4150000, 'conTrong', 'Tam Trinh tổ 17, Phường Yên Sở, Quận Hoàng Mai, Hà Nội'),
('CT0017', 7, 'Quận Nam Từ Liêm', 'Phòng tiện nghi, đầy đủ', './assets/img/houses/ct0017.jpg', 23, 5050000, 'conTrong', 'Phú Đô, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội'),
('CT0018', 8, 'Quận Bắc Từ Liêm', 'Phòng gần trường học', './assets/img/houses/ct0018.jpeg', 30, 6550000, 'conTrong', '59 Văn Tiến Dũng, Phường Phúc Diễn, Quận Bắc Từ Liêm, Hà Nội'),
('CT0019', 9, 'Huyện Thanh Trì', 'Phòng đẹp, rộng rãi', './assets/img/houses/ct0019.jpg', 20, 4450000, 'conTrong', 'Đường Kim Giang, Thôn Nội, Xã Thanh Liệt, Huyện Thanh Trì, Hà Nội'),
('CT0020', 10, 'Huyện Thanh Trì', 'Phòng giá hợp lý', './assets/img/houses/ct0020.jpg', 22, 4650000, 'conTrong', 'Khu Đấu Giá Yên Xá, Xã Tân Triều, Huyện Thanh Trì, Hà Nội');

INSERT INTO HOPDONG (MaPhong, MaNguoiThue, NgayBatDau, NgayKetThuc, TienDatCoc, TrangThai)
VALUES
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

INSERT INTO THANHTOAN (MaHopDong, NgayThanhToan, SoTien, PhuongThucThanhToan, TrangThai)
VALUES
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

INSERT INTO PHANHOI (MaPhong, MaNguoiThue, DiemDanhGia, BinhLuan)
VALUES
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

INSERT INTO THONGBAO (MaNguoiDung, NoiDung, TrangThaiDoc)
VALUES
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
(9, 'Chúng tôi đã gửi thông báo cho người thuê về phòng của bạn. Hợp đồng đã được ký.');















