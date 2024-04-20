import { canChiNgay, diaChi, ngayThangNam, ngayThangNamCanChi, nguHanh, nguHanhNapAm, sinhKhac, thienCan, timCuc } from "./AmDuong";
import { diaBan } from "./DiaBan";
import { jdFromDate } from "./LichHND";


export class lapThienBan {
  gioiTinh: number;
  namNu: string;
  chiGioSinh: any;
  canGioSinh: number;
  gioSinh: string;
  timeZone: number;
  today: string;
  ngayDuong: number;
  thangDuong: number;
  namDuong: number;
  ten: string;
  ngayAm: number;
  thangAm: number;
  namAm: number;
  thangNhuan: any;
  canThang: number;
  canNam: number;
  chiNam: number;
  chiThang: number;
  canThangTen: string;
  canNamTen: string;
  chiThangTen: string;
  chiNamTen: string;
  canNgay: number;
  chiNgay: number;
  canNgayTen: string;
  chiNgayTen: string;
  amDuongNamSinh: string;
  amDuongMenh: string;
  hanhCuc: number;
  tenCuc: string;
  menhChu: string;
  thanChu: string;
  menh: any;
  sinhKhac: string;
  banMenh: number;

  constructor(
    nn: number,
    tt: number,
    nnnn: number,
    gioSinh: number,
    gioiTinh: number,
    ten: string,
    diaBan: diaBan,
    duongLich: boolean = true,
    timeZone: number = 7
  ) {
    this.gioiTinh = gioiTinh === 1 ? 1 : -1;
    this.namNu = gioiTinh === 1 ? 'Nam' : 'Nữ';

    const chiGioSinh: any = diaChi[gioSinh];
    const canGioSinh: number = ((jdFromDate(nn, tt, nnnn) - 1) * 2 % 10 + gioSinh) % 10;
    this.chiGioSinh = chiGioSinh;
    this.canGioSinh = canGioSinh === 0 ? 10 : canGioSinh;

    this.gioSinh = `${thienCan[this.canGioSinh].tenCan} ${chiGioSinh.tenChi}`;

    this.timeZone = timeZone;
    this.today = new Date().toLocaleDateString();
    this.ngayDuong = nn;
    this.thangDuong = tt;
    this.namDuong = nnnn;
    this.ten = ten;

    if (duongLich) {
      [this.ngayAm, this.thangAm, this.namAm, this.thangNhuan] = ngayThangNam(
        this.ngayDuong,
        this.thangDuong,
        this.namDuong,
        true,
        this.timeZone
      );
    } else {
      this.ngayAm = this.ngayDuong;
      this.thangAm = this.thangDuong;
      this.namAm = this.namDuong;
    }

    [this.canThang, this.canNam, this.chiNam] = ngayThangNamCanChi(
      this.ngayAm,
      this.thangAm,
      this.namAm,
      false,
      this.timeZone
    );
    this.chiThang = this.thangAm;
    this.canThangTen = thienCan[this.canThang].tenCan;
    this.canNamTen = thienCan[this.canNam].tenCan;
    this.chiThangTen = diaChi[this.thangAm].tenChi;
    this.chiNamTen = diaChi[this.chiNam].tenChi;

    [this.canNgay, this.chiNgay] = canChiNgay(
      this.ngayDuong,
      this.thangDuong,
      this.namDuong,
      duongLich,
      timeZone
    );
    this.canNgayTen = thienCan[this.canNgay].tenCan;
    this.chiNgayTen = diaChi[this.chiNgay].tenChi;

    const cungAmDuong: number = diaBan.cungMenh % 2 === 1 ? 1 : -1;
    this.amDuongNamSinh = this.chiNam % 2 === 1 ? 'Dương' : 'Âm';
    this.amDuongMenh = cungAmDuong * this.gioiTinh === 1 ? 'Âm dương thuận lý' : 'Âm dương nghịch lý';

    const cuc: any = timCuc(diaBan.cungMenh, this.canNam);
    this.hanhCuc = nguHanh(cuc).id;
    this.tenCuc = nguHanh(cuc).tenCuc;

    this.menhChu = diaChi[this.canNam].menhChu;
    this.thanChu = diaChi[this.canNam].thanChu;

    this.menh = nguHanhNapAm(this.chiNam, this.canNam);
    const menhId: number = nguHanh(this.menh).id;
    const menhCuc: any = sinhKhac(menhId, this.hanhCuc);
    this.sinhKhac =
      menhCuc === 1
        ? 'Bản Mệnh sinh Cục'
        : menhCuc === -1
          ? 'Bản Mệnh khắc Cục'
          : menhCuc === '-1j'
            ? 'Cục khắc Bản Mệnh'
            : menhCuc === '1j'
              ? 'Cục sinh Bản mệnh'
              : 'Cục hòa Bản Mệnh';

    this.banMenh = nguHanhNapAm(this.chiNam, this.canNam, true);
  }
}