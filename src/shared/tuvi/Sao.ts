import { nguHanh } from "./AmDuong";

export class Sao {
  saoID: number;
  saoTen: string;
  saoNguHanh: string;
  saoLoai: number;
  saoPhuongVi: string;
  saoAmDuong: number;
  vongTrangSinh: number;
  cssSao: string;
  saoDacTinh: string | null;
  saoViTriCung: any;

  constructor(saoID: number, saoTen: string, saoNguHanh: string, saoLoai: number = 2, saoPhuongVi: string = "", saoAmDuong: number = null, vongTrangSinh: number = 0) {
    this.saoID = saoID;
    this.saoTen = saoTen;
    this.saoNguHanh = saoNguHanh;
    this.saoLoai = saoLoai;
    this.saoPhuongVi = saoPhuongVi;
    this.saoAmDuong = saoAmDuong;
    this.vongTrangSinh = vongTrangSinh
    this.cssSao = nguHanh(saoNguHanh)['css'];
    this.saoDacTinh = null;
  }

  anDacTinh(dacTinh: string): this {
    console.log("🚀 ~ Sao ~ anDacTinh ~ dacTinh:", dacTinh)
    const dt: { [key: string]: string } = {
      "V": "vuongDia",
      "M": "mieuDia",
      "Đ": "dacDia",
      "B": "binhHoa",
      "H": "hamDia",
    };
    this.saoDacTinh = dacTinh;
    return this;
  }

  anCung(saoViTriCung: any): this {
    this.saoViTriCung = saoViTriCung;
    return this;
  }
}


// # Tử vi tinh hệ
export const saoTuVi = new Sao(1, "Tử vi", "O", 1, "Đế tinh", 1, 0)
export const saoLiemTrinh = new Sao(2, "Liêm trinh", "H", 1, "Bắc đẩu tinh", 1, 0)
export const saoThienDong = new Sao(3, "Thiên đồng", "T", 1, "Bắc đẩu tinh", 1, 0)
export const saoVuKhuc = new Sao(4, "Vũ khúc", "K", 1, "Bắc đẩu tinh", -1, 0)
export const saoThaiDuong = new Sao(5, "Thái Dương", "H", 1, "Nam đẩu tinh", 1, 0)
export const saoThienCo = new Sao(6, "Thiên cơ", "M", 1, "Nam đẩu tinh", -1, 0)

// #Thiên phủ tinh hệ
export const saoThienPhu = new Sao(7, "Thiên phủ", "O", 1, "Nam đẩu tinh", 1, 0)
export const saoThaiAm = new Sao(8, "Thái âm", "T", 1, "Bắc đẩu tinh", -1, 0)
export const saoThamLang = new Sao(9, "Tham lang", "T", 1, "Bắc đẩu tinh", -1, 0)
export const saoCuMon = new Sao(10, "Cự môn", "T", 1, "Bắc đẩu tinh", -1, 0)
export const saoThienTuong = new Sao(11, "Thiên tướng", "T", 1, "Nam đẩu tinh", 1, 0)
export const saoThienLuong = new Sao(12, "Thiên lương", "M", 1, "Nam đẩu tinh", -1, 0)
export const saoThatSat = new Sao(13, "Thất sát", "K", 1, "Nam đẩu tinh", 1, 0)
export const saoPhaQuan = new Sao(14, "Phá quân", "T", 1, "Bắc đẩu tinh", -1, 0)

// #Vòng Địa chi - Thái tuế
export const saoThaiTue = new Sao(15, "Thái tuế", "H", 15, "", 0)
export const saoThieuDuong = new Sao(16, "Thiếu dương", "H", 5)
export const saoTangMon = new Sao(17, "Tang môn", "M", 12)
export const saoThieuAm = new Sao(18, "Thiếu âm", "T", 5)
export const saoQuanPhu3 = new Sao(19, "Quan phù", "H", 12)
export const saoTuPhu = new Sao(20, "Tử phù", "K", 12)
export const saoTuePha = new Sao(21, "Tuế phá", "H", 12)
export const saoLongDuc = new Sao(22, "Long đức", "T", 5)
export const saoBachHo = new Sao(23, "Bạch hổ", "K", 12)
export const saoPhucDuc = new Sao(24, "Phúc đức", "O", 5)
export const saoDieuKhach = new Sao(25, "Điếu khách", "H", 12)
export const saoTrucPhu = new Sao(26, "Trực phù", "K", 16)

// # Vòng Thiên can - Lộc tồn
export const saoLocTon = new Sao(27, "Lộc tồn", "O", 3, "Bắc đẩu tinh")
export const saoBacSy = new Sao(109, "Bác sỹ", "T", 5,)
export const saoLucSi = new Sao(28, "Lực sĩ", "H", 2)
export const saoThanhLong = new Sao(29, "Thanh long", "T", 5)
export const saoTieuHao = new Sao(30, "Tiểu hao", "H", 12)
export const saoTuongQuan = new Sao(31, "Tướng quân", "M", 4)
export const saoTauThu = new Sao(32, "Tấu thư", "K", 3)
export const saoPhiLiem = new Sao(33, "Phi liêm", "H", 2)
export const saoHyThan = new Sao(34, "Hỷ thần", "H", 5)
export const saoBenhPhu = new Sao(35, "Bệnh phù", "O", 12)
export const saoDaiHao = new Sao(36, "Đại hao", "H", 12)
export const saoPhucBinh = new Sao(37, "Phục binh", "H", 13)
export const saoQuanPhu2 = new Sao(38, "Quan phù", "H", 12)

// #Vòng Tràng sinh
export const saoTrangSinh = new Sao(39, "Tràng sinh", "T", 5, null, 1)
export const saoMocDuc = new Sao(40, "Mộc dục", "T", 14, null, 1)
export const saoQuanDoi = new Sao(41, "Quan đới", "K", 4, null, 1)
export const saoLamQuan = new Sao(42, "Lâm quan", "K", 7, null, 1)
export const saoDeVuong = new Sao(43, "Đế vượng", "K", 5, null, 1)
export const saoSuy = new Sao(44, "Suy", "T", 12, null, 1)
export const saoBenh = new Sao(45, "Bệnh", "H", 12, null, 1)
export const saoTu = new Sao(46, "Tử", "H", 12, null, 1)
export const saoMo = new Sao(47, "Mộ", "O", null, null, 1)
export const saoTuyet = new Sao(48, "Tuyệt", "O", 12, null, 1)
export const saoThai = new Sao(49, "Thai", "O", 14, null, 1)
export const saoDuong = new Sao(50, "Dưỡng", "M", 2, null, 1)

// #Lục sát
// #   Kình dương đà la
export const saoDaLa = new Sao(51, "Đà la", "K", 11)
export const saoKinhDuong = new Sao(52, "Kình dương", "K", 11)

// #   Địa không - Địa kiếp
export const saoDiaKhong = new Sao(53, "Địa không", "H", 11)
export const saoDiaKiep = new Sao(54, "Địa kiếp", "H", 11)

// #   Hỏa tinh - Linh tinh
export const saoLinhTinh = new Sao(55, "Linh tinh", "H", 11)
export const saoHoaTinh = new Sao(56, "Hỏa tinh", "H", 11)

// #new Sao Âm Dương
// #   Văn xương - Văn khúc
export const saoVanXuong = new Sao(57, "Văn xương", "K", 6)
export const saoVanKhuc = new Sao(58, "Văn Khúc", "T", 6)

// #   Thiên khôi - Thiên Việt
export const saoThienKhoi = new Sao(59, "Thiên khôi", "H", 6)
export const saoThienViet = new Sao(60, "Thiên việt", "H", 6)

// #   Tả phù - Hữu bật
export const saoTaPhu = new Sao(61, "Tả phù", "O", 2)
export const saoHuuBat = new Sao(62, "Hữu bật", "O", 2)

// #   Long trì - Phượng các
export const saoLongTri = new Sao(63, "Long trì", "T", 3, null, 1)
export const saoPhuongCac = new Sao(64, "Phượng các", "O", 3, null, 1)

// #   Tam thai - Bát tọa
export const saoTamThai = new Sao(65, "Tam thai", "M", 7)
export const saoBatToa = new Sao(66, "Bát tọa", "T", 7)

// #   Ân quang - Thiên quý
export const saoAnQuang = new Sao(67, "Ân quang", "M", 3)
export const saoThienQuy = new Sao(68, "Thiên quý", "O", 3)

// #new Sao đôi khác
export const saoThienKhoc = new Sao(69, "Thiên khốc", "T", 12)
export const saoThienHu = new Sao(70, "Thiên hư", "T", 12)
export const saoThienDuc = new Sao(71, "Thiên đức", "H", 5)
export const saoNguyetDuc = new Sao(72, "Nguyệt đức", "H", 5)
export const saoThienHinh = new Sao(73, "Thiên hình", "H", 15)
export const saoThienRieu = new Sao(74, "Thiên riêu", "T", 13)
export const saoThienY = new Sao(75, "Thiên y", "T", 5)
export const saoQuocAn = new Sao(76, "Quốc ấn", "O", 6)
export const saoDuongPhu = new Sao(77, "Đường phù", "M", 4)
export const saoDaoHoa = new Sao(78, "Đào hoa", "M", 8)
export const saoHongLoan = new Sao(79, "Hồng loan", "T", 8)
export const saoThienHy = new Sao(80, "Thiên hỷ", "T", 5)
export const saoThienGiai = new Sao(81, "Thiên giải", "H", 5)
export const saoDiaGiai = new Sao(82, "Địa giải", "O", 5)
export const saoGiaiThan = new Sao(83, "Giải thần", "M", 5)
export const saoThaiPhu = new Sao(84, "Thai phụ", "O", 6, null, 1)
export const saoPhongCao = new Sao(85, "Phong cáo", "O", 4, null, 1)
export const saoThienTai = new Sao(86, "Thiên tài", "O", 2)
export const saoThienTho = new Sao(87, "Thiên thọ", "O", 5)
export const saoThienThuong = new Sao(88, "Thiên thương", "O", 12)
export const saoThienSu = new Sao(89, "Thiên sứ", "T", 12)
export const saoThienLa = new Sao(90, "Thiên la", "O", 12)
export const saoDiaVong = new Sao(91, "Địa võng", "O", 12)
export const saoHoaKhoa = new Sao(92, "Hóa khoa", "T", 5)
export const saoHoaQuyen = new Sao(93, "Hóa quyền", "T", 4)
export const saoHoaLoc = new Sao(94, "Hóa lộc", "M", 3)
export const saoHoaKy = new Sao(95, "Hóa kỵ", "T", 13)
export const saoCoThan = new Sao(96, "Cô thần", "O", 13)
export const saoQuaTu = new Sao(97, "Quả tú", "O", 13)
export const saoThienMa = new Sao(98, "Thiên mã", "H", 3)
export const saoPhaToai = new Sao(99, "Phá toái", "H", 12)
export const saoThienQuan = new Sao(100, "Thiên quan", "H", 5)
export const saoThienPhuc = new Sao(101, "Thiên phúc", "H", 5)
export const saoLuuHa = new Sao(102, "Lưu hà", "T", 12)
export const saoThienTru = new Sao(103, "Thiên trù", "O", 5)
export const saoKiepSat = new Sao(104, "Kiếp sát", "H", 11)
export const saoHoaCai = new Sao(105, "Hoa cái", "K", 14)
export const saoVanTinh = new Sao(106, "Văn tinh", "H", 6)
export const saoDauQuan = new Sao(107, "Đẩu quân", "H", 5)
export const saoThienKhong = new Sao(108, "Thiên không", "H", 11)
