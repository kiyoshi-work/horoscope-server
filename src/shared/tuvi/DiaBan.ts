import {
  diaChi,
  dichCung,
  khoangCachCung,
  ngayThangNam,
  ngayThangNamCanChi,
  nguHanh,
  thienCan,
  timCoThan,
  timCuc,
  timHoaLinh,
  timLuuTru,
  timPhaToai,
  timThienKhoi,
  timThienMa,
  timThienQuanThienPhuc,
  timTrangSinh,
  timTriet,
  timTuVi,
} from './AmDuong';
import {
  saoAnQuang,
  saoBacSy,
  saoBachHo,
  saoBatToa,
  saoBenh,
  saoBenhPhu,
  saoCoThan,
  saoCuMon,
  saoDaLa,
  saoDaiHao,
  saoDaoHoa,
  saoDauQuan,
  saoDeVuong,
  saoDiaGiai,
  saoDiaKhong,
  saoDiaKiep,
  saoDiaVong,
  saoDieuKhach,
  saoDuong,
  saoDuongPhu,
  saoGiaiThan,
  saoHoaCai,
  saoHoaKhoa,
  saoHoaKy,
  saoHoaLoc,
  saoHoaQuyen,
  saoHoaTinh,
  saoHongLoan,
  saoHuuBat,
  saoHyThan,
  saoKiepSat,
  saoKinhDuong,
  saoLamQuan,
  saoLiemTrinh,
  saoLinhTinh,
  saoLocTon,
  saoLongDuc,
  saoLongTri,
  saoLucSi,
  saoLuuHa,
  saoMo,
  saoMocDuc,
  saoNguyetDuc,
  saoPhaQuan,
  saoPhaToai,
  saoPhiLiem,
  saoPhongCao,
  saoPhucBinh,
  saoPhucDuc,
  saoPhuongCac,
  saoQuaTu,
  saoQuanDoi,
  saoQuanPhu2,
  saoQuanPhu3,
  saoQuocAn,
  saoSuy,
  saoTaPhu,
  saoTamThai,
  saoTangMon,
  saoTauThu,
  saoThai,
  saoThaiAm,
  saoThaiDuong,
  saoThaiPhu,
  saoThaiTue,
  saoThamLang,
  saoThanhLong,
  saoThatSat,
  saoThienCo,
  saoThienDong,
  saoThienDuc,
  saoThienGiai,
  saoThienHinh,
  saoThienHu,
  saoThienHy,
  saoThienKhoc,
  saoThienKhoi,
  saoThienKhong,
  saoThienLa,
  saoThienLuong,
  saoThienMa,
  saoThienPhu,
  saoThienPhuc,
  saoThienQuan,
  saoThienQuy,
  saoThienRieu,
  saoThienSu,
  saoThienTai,
  saoThienTho,
  saoThienThuong,
  saoThienTru,
  saoThienTuong,
  saoThienViet,
  saoThienY,
  saoThieuAm,
  saoThieuDuong,
  saoTieuHao,
  saoTrangSinh,
  saoTrucPhu,
  saoTu,
  saoTuPhu,
  saoTuVi,
  saoTuePha,
  saoTuongQuan,
  saoTuyet,
  saoVanKhuc,
  saoVanTinh,
  saoVanXuong,
  saoVuKhuc,
} from './Sao';

class cungDiaBan {
  cungSo: number;
  hanhCung: string;
  cungSao: any[];
  cungAmDuong: number;
  cungTen: string;
  cungThan: boolean;
  cungChu?: string;
  cungDaiHan?: number;
  cungTieuHan?: string;
  tuanTrung?: boolean;
  trietLo?: boolean;

  constructor(cungID: number) {
    const hanhCung: string[] = [
      null,
      'Thủy',
      'Thổ',
      'Mộc',
      'Mộc',
      'Thổ',
      'Hỏa',
      'Hỏa',
      'Thổ',
      'Kim',
      'Kim',
      'Thổ',
      'Thủy',
    ];
    this.cungSo = cungID;
    this.hanhCung = hanhCung[cungID];
    this.cungSao = [];
    this.cungAmDuong = this.cungSo % 2 === 0 ? -1 : 1;
    this.cungTen = diaChi[this.cungSo].tenChi;
    this.cungThan = false;
  }

  themSao(sao: any): this {
    dacTinhSao(this.cungSo, sao);
    this.cungSao.push(sao);
    return this;
  }

  _cungChu(tenCungChu: string): this {
    this.cungChu = tenCungChu;
    return this;
  }

  daiHan(daiHan: string): this {
    this.cungDaiHan = Number(daiHan);
    return this;
  }

  tieuHan(tieuHan: number): this {
    this.cungTieuHan = diaChi[tieuHan + 1].tenChi;
    return this;
  }

  anCungThan(): void {
    this.cungThan = true;
  }

  anTuan(): void {
    this.tuanTrung = true;
  }

  anTriet(): void {
    this.trietLo = true;
  }
}

export class diaBan {
  thangSinhAmLich: number;
  gioSinhAmLich: number;
  thapNhiCung: cungDiaBan[];
  cungThan: number;
  cungMenh: number;
  cungNoboc: number;
  cungTatAch: number;

  constructor(thangSinhAmLich: number, gioSinhAmLich: number) {
    this.thangSinhAmLich = thangSinhAmLich;
    this.gioSinhAmLich = gioSinhAmLich;
    this.thapNhiCung = [...Array(13).keys()].map((i) => new cungDiaBan(i));
    this.nhapCungChu();
    this.nhapCungThan();
  }

  cungChu(
    thangSinhAmLich: number,
    gioSinhAmLich: number,
  ): { cungSoDiaBan: number; tenCung: string }[] {
    console.log(
      '🚀 ~ diaBan ~ cungChu ~ thangSinhAmLich: number, gioSinhAmLich: number:',
      thangSinhAmLich,
      gioSinhAmLich,
    );
    this.cungThan = dichCung(3, thangSinhAmLich - 1, gioSinhAmLich - 1);

    // Bắt đầu từ cung số 3, tương ứng với Dần, tương ứng với tháng 1 trong năm
    // Tiến theo chiều tháng sinh
    // Giật lùi lại theo chiều ngày sinh
    // this.cungThan = dichCung(3, thangSinhAmLich - 1);
    // this.cungThan = dichCung(this.cungThan, 1 - gioSinhAmLich);

    this.cungMenh = dichCung(3, thangSinhAmLich - 1, -gioSinhAmLich + 1);
    const cungPhuMau = dichCung(this.cungMenh, 1);
    const cungPhucDuc = dichCung(this.cungMenh, 2);
    const cungDienTrach = dichCung(this.cungMenh, 3);
    const cungQuanLoc = dichCung(this.cungMenh, 4);
    this.cungNoboc = dichCung(this.cungMenh, 5); // Để an sao Thiên thương
    const cungThienDi = dichCung(this.cungMenh, 6);
    this.cungTatAch = dichCung(this.cungMenh, 7); // an sao Thiên sứ
    const cungTaiBach = dichCung(this.cungMenh, 8);
    const cungTuTuc = dichCung(this.cungMenh, 9);
    const cungTheThiep = dichCung(this.cungMenh, 10);
    const cungHuynhDe = dichCung(this.cungMenh, 11);

    const cungChuThapNhiCung: {
      cungSoDiaBan: number;
      tenCung: string;
      cungId: number;
    }[] = [
      {
        cungId: 1,
        tenCung: 'Mệnh',
        cungSoDiaBan: this.cungMenh,
      },
      {
        cungId: 2,
        tenCung: 'Phụ mẫu',
        cungSoDiaBan: cungPhuMau,
      },
      {
        cungId: 3,
        tenCung: 'Phúc đức',
        cungSoDiaBan: cungPhucDuc,
      },
      {
        cungId: 4,
        tenCung: 'Điền trạch',
        cungSoDiaBan: cungDienTrach,
      },
      {
        cungId: 5,
        tenCung: 'Quan lộc',
        cungSoDiaBan: cungQuanLoc,
      },
      {
        cungId: 6,
        tenCung: 'Nô bộc',
        cungSoDiaBan: this.cungNoboc,
      },
      {
        cungId: 7,
        tenCung: 'Thiên di',
        cungSoDiaBan: cungThienDi,
      },
      {
        cungId: 8,
        tenCung: 'Tật Ách',
        cungSoDiaBan: this.cungTatAch,
      },
      {
        cungId: 9,
        tenCung: 'Tài Bạch',
        cungSoDiaBan: cungTaiBach,
      },
      {
        cungId: 10,
        tenCung: 'Tử tức',
        cungSoDiaBan: cungTuTuc,
      },
      {
        cungId: 11,
        tenCung: 'Phu thê',
        cungSoDiaBan: cungTheThiep,
      },
      {
        cungId: 12,
        tenCung: 'Huynh đệ',
        cungSoDiaBan: cungHuynhDe,
      },
    ];

    return cungChuThapNhiCung;
  }

  nhapCungChu(): this {
    for (const cung of this.cungChu(this.thangSinhAmLich, this.gioSinhAmLich)) {
      this.thapNhiCung[cung.cungSoDiaBan]._cungChu(cung.tenCung);
    }
    return this;
  }

  nhapDaiHan(cucSo: number, gioiTinh: number): this {
    for (const cung of this.thapNhiCung) {
      const khoangCach = khoangCachCung(cung.cungSo, this.cungMenh, gioiTinh);
      cung.daiHan(String(cucSo + khoangCach * 10));
    }
    return this;
  }

  nhapTieuHan(khoiTieuHan: number, gioiTinh: number, chiNam: number): this {
    // Vị trí khởi tiểu Hạn là của năm sinh theo chi
    // vì vậy cần phải tìm vị trí cung Tý của năm đó
    const viTriCungTy1 = dichCung(khoiTieuHan, -gioiTinh * (chiNam - 1));

    // Tiếp đó là nhập hạn
    for (const cung of this.thapNhiCung) {
      const khoangCach = khoangCachCung(cung.cungSo, viTriCungTy1, gioiTinh);
      cung.tieuHan(khoangCach);
    }
    return this;
  }

  nhapCungThan(): void {
    this.thapNhiCung[this.cungThan].anCungThan();
  }

  nhapSao(cungSo: number, ...args: string[]): this {
    console.log('🚀 ~ diaBan ~ nhapSao ~ cungSo:', cungSo);
    for (const sao of args) {
      this.thapNhiCung[cungSo].themSao(sao);
    }
    return this;
  }

  nhapTuan(...args: number[]): this {
    for (const cung of args) {
      this.thapNhiCung[cung].anTuan();
    }
    return this;
  }

  nhapTriet(...args: number[]): this {
    for (const cung of args) {
      this.thapNhiCung[cung].anTriet();
    }
    return this;
  }
}

export function dacTinhSao(viTriDiaBan: number, sao: any): void {
  const saoId: number = sao.saoID;
  const maTranDacTinh: { [key: number]: string[] } = {
    1: ['Tử vi', 'B', 'Đ', 'M', 'B', 'V', 'M', 'M', 'Đ', 'M', 'B', 'V', 'B'],
    2: [
      'Liêm trinh',
      'V',
      'Đ',
      'V',
      'H',
      'M',
      'H',
      'V',
      'Đ',
      'V',
      'H',
      'M',
      'H',
    ],
    3: [
      'Thiên đồng',
      'V',
      'H',
      'M',
      'Đ',
      'H',
      'Đ',
      'H',
      'H',
      'M',
      'H',
      'H',
      'Đ',
    ],
    4: ['Vũ khúc', 'V', 'M', 'V', 'Đ', 'M', 'H', 'V', 'M', 'V', 'Đ', 'M', 'H'],
    5: [
      'Thái dương',
      'H',
      'Đ',
      'V',
      'V',
      'V',
      'M',
      'M',
      'Đ',
      'H',
      'H',
      'H',
      'H',
    ],
    6: ['Thiên cơ', 'Đ', 'Đ', 'H', 'M', 'M', 'V', 'Đ', 'Đ', 'V', 'M', 'M', 'H'],
    7: [
      'Thiên phủ',
      'M',
      'B',
      'M',
      'B',
      'V',
      'Đ',
      'M',
      'Đ',
      'M',
      'B',
      'V',
      'Đ',
    ],
    8: ['Thái âm', 'V', 'Đ', 'H', 'H', 'H', 'H', 'H', 'Đ', 'V', 'M', 'M', 'M'],
    9: [
      'Tham lang',
      'H',
      'M',
      'Đ',
      'H',
      'V',
      'H',
      'H',
      'M',
      'Đ',
      'H',
      'V',
      'H',
    ],
    10: ['Cự môn', 'V', 'H', 'V', 'M', 'H', 'H', 'V', 'H', 'Đ', 'M', 'H', 'Đ'],
    11: [
      'Thiên tướng',
      'V',
      'Đ',
      'M',
      'H',
      'V',
      'Đ',
      'V',
      'Đ',
      'M',
      'H',
      'V',
      'Đ',
    ],
    12: [
      'Thiên lương',
      'V',
      'Đ',
      'V',
      'V',
      'M',
      'H',
      'M',
      'Đ',
      'V',
      'H',
      'M',
      'H',
    ],
    13: [
      'Thất sát',
      'M',
      'Đ',
      'M',
      'H',
      'H',
      'V',
      'M',
      'Đ',
      'M',
      'H',
      'H',
      'V',
    ],
    14: [
      'Phá quân',
      'M',
      'V',
      'H',
      'H',
      'Đ',
      'H',
      'M',
      'V',
      'H',
      'H',
      'Đ',
      'H',
    ],
    51: ['Đà la', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H'],
    52: [
      'Kình dương',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
      'H',
    ],
    55: [
      'Linh tinh',
      'H',
      'H',
      'Đ',
      'Đ',
      'Đ',
      'Đ',
      'Đ',
      'H',
      'H',
      'H',
      'H',
      'H',
    ],
    56: [
      'Hỏa tinh',
      'H',
      'H',
      'Đ',
      'Đ',
      'Đ',
      'Đ',
      'Đ',
      'H',
      'H',
      'H',
      'H',
      'H',
    ],
    57: [
      'Văn xương',
      'H',
      'Đ',
      'H',
      'Đ',
      'H',
      'Đ',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
      'Đ',
    ],
    58: [
      'Văn khúc',
      'H',
      'Đ',
      'H',
      'Đ',
      'H',
      'Đ',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
      'Đ',
    ],
    53: [
      'Địa không',
      'H',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
    ],
    54: [
      'Địa kiếp',
      'H',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
      'H',
      'H',
      'Đ',
    ],
    95: [
      'Hóa kỵ',
      null,
      'Đ',
      null,
      null,
      'Đ',
      null,
      null,
      'Đ',
      null,
      null,
      'Đ',
      null,
    ],
    36: [
      'Đại hao',
      null,
      null,
      'Đ',
      'Đ',
      null,
      null,
      null,
      null,
      'Đ',
      'Đ',
      null,
      null,
    ],
    30: [
      'Tiểu Hao',
      null,
      null,
      'Đ',
      'Đ',
      null,
      null,
      null,
      null,
      'Đ',
      'Đ',
      null,
      null,
    ],
    69: [
      'Thiên khốc',
      'Đ',
      'Đ',
      null,
      'Đ',
      null,
      null,
      'Đ',
      'Đ',
      null,
      'Đ',
      null,
      null,
    ],
    70: [
      'Thiên hư',
      'Đ',
      'Đ',
      null,
      'Đ',
      null,
      null,
      'Đ',
      'Đ',
      null,
      'Đ',
      null,
      null,
    ],
    98: [
      'Thiên mã',
      null,
      null,
      'Đ',
      null,
      null,
      'Đ',
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    73: [
      'Thiên Hình',
      null,
      null,
      'Đ',
      'Đ',
      null,
      null,
      null,
      null,
      'Đ',
      'Đ',
      null,
      null,
    ],
    74: [
      'Thiên riêu',
      null,
      null,
      'Đ',
      'Đ',
      null,
      null,
      null,
      null,
      null,
      'Đ',
      'Đ',
      null,
    ],
  };
  if (sao.saoID in maTranDacTinh) {
    if (
      ['M', 'V', 'Đ', 'B', 'H'].includes(maTranDacTinh[sao.saoID][viTriDiaBan])
    ) {
      sao.anDacTinh(maTranDacTinh[sao.saoID][viTriDiaBan]);
    }
  }
}

export function lapDiaBan(
  diaBan: any,
  nn: number,
  tt: number,
  nnnn: number,
  gioSinh: number,
  gioiTinh: number,
  duongLich: boolean,
  timeZone: number,
): diaBan {
  let thangNhuan: number;
  if (duongLich) {
    [nn, tt, nnnn, thangNhuan] = ngayThangNam(
      nn,
      tt,
      nnnn,
      duongLich,
      timeZone,
    );
  }
  const [canThang, canNam, chiNam] = ngayThangNamCanChi(
    nn,
    tt,
    nnnn,
    false,
    timeZone,
  );

  diaBan = new diaBan(tt, gioSinh);

  const amDuongNamSinh = thienCan[canNam].amDuong;
  const amDuongChiNamSinh = diaChi[chiNam].amDuong;

  const hanhCuc = timCuc(diaBan.cungMenh, canNam);
  const cuc = nguHanh(hanhCuc);
  const cucSo = cuc.cuc;

  diaBan = diaBan.nhapDaiHan(cucSo, gioiTinh * amDuongChiNamSinh);

  const khoiHan = dichCung(11, -3 * (chiNam - 1));
  diaBan = diaBan.nhapTieuHan(khoiHan, gioiTinh, chiNam);

  const viTriTuVi = timTuVi(cucSo, nn);
  diaBan.nhapSao(viTriTuVi, saoTuVi);

  const viTriLiemTrinh = dichCung(viTriTuVi, 4);
  diaBan.nhapSao(viTriLiemTrinh, saoLiemTrinh);

  const viTriThienDong = dichCung(viTriTuVi, 7);
  diaBan.nhapSao(viTriThienDong, saoThienDong);

  const viTriVuKhuc = dichCung(viTriTuVi, 8);
  diaBan.nhapSao(viTriVuKhuc, saoVuKhuc);

  const vitriThaiDuong = dichCung(viTriTuVi, 9);
  diaBan.nhapSao(vitriThaiDuong, saoThaiDuong);

  const viTriThienCo = dichCung(viTriTuVi, 11);
  diaBan.nhapSao(viTriThienCo, saoThienCo);

  const viTriThienPhu = dichCung(3, 3 - viTriTuVi);
  diaBan.nhapSao(viTriThienPhu, saoThienPhu);

  const viTriThaiAm = dichCung(viTriThienPhu, 1);
  diaBan.nhapSao(viTriThaiAm, saoThaiAm);

  const viTriThamLang = dichCung(viTriThienPhu, 2);
  diaBan.nhapSao(viTriThamLang, saoThamLang);

  const viTriCuMon = dichCung(viTriThienPhu, 3);
  diaBan.nhapSao(viTriCuMon, saoCuMon);

  const viTriThienTuong = dichCung(viTriThienPhu, 4);
  diaBan.nhapSao(viTriThienTuong, saoThienTuong);

  const viTriThienLuong = dichCung(viTriThienPhu, 5);
  diaBan.nhapSao(viTriThienLuong, saoThienLuong);

  const viTriThatSat = dichCung(viTriThienPhu, 6);
  diaBan.nhapSao(viTriThatSat, saoThatSat);

  const viTriPhaQuan = dichCung(viTriThienPhu, 10);
  diaBan.nhapSao(viTriPhaQuan, saoPhaQuan);

  const viTriLocTon = thienCan[canNam].vitriDiaBan;
  diaBan.nhapSao(viTriLocTon, saoLocTon, saoBacSy);

  const amDuongNamNu = gioiTinh * amDuongNamSinh;
  const viTriLucSi = dichCung(viTriLocTon, 1 * amDuongNamNu);
  diaBan.nhapSao(viTriLucSi, saoLucSi);

  const viTriThanhLong = dichCung(viTriLocTon, 2 * amDuongNamNu);
  diaBan.nhapSao(viTriThanhLong, saoThanhLong);

  const viTriTieuHao = dichCung(viTriLocTon, 3 * amDuongNamNu);
  diaBan.nhapSao(viTriTieuHao, saoTieuHao);

  const viTriTuongQuan = dichCung(viTriLocTon, 4 * amDuongNamNu);
  diaBan.nhapSao(viTriTuongQuan, saoTuongQuan);

  const viTriTauThu = dichCung(viTriLocTon, 5 * amDuongNamNu);
  diaBan.nhapSao(viTriTauThu, saoTauThu);

  const viTriPhiLiem = dichCung(viTriLocTon, 6 * amDuongNamNu);
  diaBan.nhapSao(viTriPhiLiem, saoPhiLiem);

  const viTriHyThan = dichCung(viTriLocTon, 7 * amDuongNamNu);
  diaBan.nhapSao(viTriHyThan, saoHyThan);

  const viTriBenhPhu = dichCung(viTriLocTon, 8 * amDuongNamNu);
  diaBan.nhapSao(viTriBenhPhu, saoBenhPhu);

  const viTriDaiHao = dichCung(viTriLocTon, 9 * amDuongNamNu);
  diaBan.nhapSao(viTriDaiHao, saoDaiHao);

  const viTriPhucBinh = dichCung(viTriLocTon, 10 * amDuongNamNu);
  diaBan.nhapSao(viTriPhucBinh, saoPhucBinh);

  const viTriQuanPhu2 = dichCung(viTriLocTon, 11 * amDuongNamNu);
  diaBan.nhapSao(viTriQuanPhu2, saoQuanPhu2);

  const viTriThaiTue = chiNam;
  diaBan.nhapSao(viTriThaiTue, saoThaiTue);

  const viTriThieuDuong = dichCung(viTriThaiTue, 1);
  diaBan.nhapSao(viTriThieuDuong, saoThieuDuong, saoThienKhong);

  const viTriTangMon = dichCung(viTriThaiTue, 2);
  diaBan.nhapSao(viTriTangMon, saoTangMon);

  const viTriThieuAm = dichCung(viTriThaiTue, 3);
  diaBan.nhapSao(viTriThieuAm, saoThieuAm);

  const viTriQuanPhu3 = dichCung(viTriThaiTue, 4);
  diaBan.nhapSao(viTriQuanPhu3, saoQuanPhu3);

  const viTriTuPhu = dichCung(viTriThaiTue, 5);
  diaBan.nhapSao(viTriTuPhu, saoTuPhu, saoNguyetDuc);

  const viTriTuePha = dichCung(viTriThaiTue, 6);
  diaBan.nhapSao(viTriTuePha, saoTuePha);

  const viTriLongDuc = dichCung(viTriThaiTue, 7);
  diaBan.nhapSao(viTriLongDuc, saoLongDuc);

  const viTriBachHo = dichCung(viTriThaiTue, 8);
  diaBan.nhapSao(viTriBachHo, saoBachHo);

  const viTriPhucDuc = dichCung(viTriThaiTue, 9);
  diaBan.nhapSao(viTriPhucDuc, saoPhucDuc, saoThienDuc);

  const viTriDieuKhach = dichCung(viTriThaiTue, 10);
  diaBan.nhapSao(viTriDieuKhach, saoDieuKhach);

  const viTriTrucPhu = dichCung(viTriThaiTue, 11);
  diaBan.nhapSao(viTriTrucPhu, saoTrucPhu);

  // #  Vòng ngũ hành cục Tràng sinh
  // # !!! Đã sửa !!! *LƯU Ý Phần này đã sửa* Theo cụ Thiên Lương: Nam -> Thuận,
  // # Nữ -> Nghịch (Không phù hợp)
  // # **ISSUE 2**: Dương nam, Âm nữ theo chiều thuận, Âm nam Dương nữ theo
  // # chiều nghịch

  const viTriTrangSinh = timTrangSinh(cucSo);
  diaBan.nhapSao(viTriTrangSinh, saoTrangSinh);

  const viTriMocDuc = dichCung(viTriTrangSinh, amDuongNamNu * 1);
  diaBan.nhapSao(viTriMocDuc, saoMocDuc);

  const viTriQuanDoi = dichCung(viTriTrangSinh, amDuongNamNu * 2);
  diaBan.nhapSao(viTriQuanDoi, saoQuanDoi);

  const viTriLamQuan = dichCung(viTriTrangSinh, amDuongNamNu * 3);
  diaBan.nhapSao(viTriLamQuan, saoLamQuan);

  const viTriDeVuong = dichCung(viTriTrangSinh, amDuongNamNu * 4);
  diaBan.nhapSao(viTriDeVuong, saoDeVuong);

  const viTriSuy = dichCung(viTriTrangSinh, amDuongNamNu * 5);
  diaBan.nhapSao(viTriSuy, saoSuy);

  const viTriBenh = dichCung(viTriTrangSinh, amDuongNamNu * 6);
  diaBan.nhapSao(viTriBenh, saoBenh);

  const viTriTu = dichCung(viTriTrangSinh, amDuongNamNu * 7);
  diaBan.nhapSao(viTriTu, saoTu);

  const viTriMo = dichCung(viTriTrangSinh, amDuongNamNu * 8);
  diaBan.nhapSao(viTriMo, saoMo);

  const viTriTuyet = dichCung(viTriTrangSinh, amDuongNamNu * 9);
  diaBan.nhapSao(viTriTuyet, saoTuyet);

  const viTriThai = dichCung(viTriTrangSinh, amDuongNamNu * -1);
  diaBan.nhapSao(viTriThai, saoThai);

  const viTriDuong = dichCung(viTriTrangSinh, amDuongNamNu * -2);
  diaBan.nhapSao(viTriDuong, saoDuong);

  // # An sao đôi
  // #    Kình dương - Đà la
  const viTriDaLa = dichCung(viTriLocTon, -1);
  diaBan.nhapSao(viTriDaLa, saoDaLa);

  const viTriKinhDuong = dichCung(viTriLocTon, 1);
  diaBan.nhapSao(viTriKinhDuong, saoKinhDuong);

  // #  Không - Kiếp
  // # Khởi giờ Tý ở cung Hợi, đếm thuận đến giờ sinh được cung Địa kiếp
  const viTriDiaKiep = dichCung(11, gioSinh);
  diaBan.nhapSao(viTriDiaKiep, saoDiaKiep);

  const viTriDiaKhong = dichCung(12, 12 - viTriDiaKiep);
  diaBan.nhapSao(viTriDiaKhong, saoDiaKhong);

  const [viTriHoaTinh, viTriLinhTinh] = timHoaLinh(
    chiNam,
    gioSinh,
    gioiTinh,
    amDuongNamSinh,
  );
  diaBan.nhapSao(viTriHoaTinh, saoHoaTinh);
  diaBan.nhapSao(viTriLinhTinh, saoLinhTinh);

  const viTriLongTri = dichCung(5, chiNam - 1);
  diaBan.nhapSao(viTriLongTri, saoLongTri);

  const viTriPhuongCac = dichCung(2, 2 - viTriLongTri);
  diaBan.nhapSao(viTriPhuongCac, saoPhuongCac, saoGiaiThan);

  const viTriTaPhu = dichCung(5, tt - 1);
  diaBan.nhapSao(viTriTaPhu, saoTaPhu);

  const viTriHuuBat = dichCung(2, 2 - viTriTaPhu);
  diaBan.nhapSao(viTriHuuBat, saoHuuBat);

  const viTriVanKhuc = dichCung(5, gioSinh - 1);
  diaBan.nhapSao(viTriVanKhuc, saoVanKhuc);

  const viTriVanXuong = dichCung(2, 2 - viTriVanKhuc);
  diaBan.nhapSao(viTriVanXuong, saoVanXuong);

  const viTriTamThai = dichCung(5, tt + nn - 2);
  diaBan.nhapSao(viTriTamThai, saoTamThai);

  const viTriBatToa = dichCung(2, 2 - viTriTamThai);
  diaBan.nhapSao(viTriBatToa, saoBatToa);

  // #!Vị trí sao Ân Quang - Thiên Quý
  // #!Lấy cung thìn làm mồng 1 đếm thuận đến ngày sinh,
  // #!lui lại một cung để lấy đó làm giờ tý đếm thuận đến giờ sinh là
  // #  Ân Quang
  // #!Thiên Quý đối với Ân Quang qua trục Sửu Mùi
  // # @viTriAnQuang = dichCung(5, nn + gioSinh - 3)
  // # @viTriThienQuy = dichCung(2, 2 - viTriAnQuang)
  // # Phía trên là cách an Quang - Quý theo cụ Vu Thiên
  // # Sau khi tìm hiểu thì Quang - Quý sẽ được an theo Xương - Khúc như sau:
  // # Ân Quang − Xem Văn Xương ở cung nào, kể cung ấy là mồng một
  // # bắt đầu đếm thoe chiều thuận đến ngày sinh, lùi lại một cung,
  // # an Ân Quang.
  // # Thiên Quý − Xem Văn Khúc ở cung nào, kể cung ấy là mồng một,
  // #!!!bắt đầu đếm theo chiều nghịch đến ngày sinh, lùi lại một cung,
  // # an Thiên Quý.!!!
  // # ??? Thiên Quý ở đối cung của Ân Quang qua trục Sửu Mùi mới chính xác ???

  const viTriAnQuang = dichCung(viTriVanXuong, nn - 2);
  diaBan.nhapSao(viTriAnQuang, saoAnQuang);

  const viTriThienQuy = dichCung(2, 2 - viTriAnQuang);
  diaBan.nhapSao(viTriThienQuy, saoThienQuy);

  const viTriThienKhoi = timThienKhoi(canNam);
  diaBan.nhapSao(viTriThienKhoi, saoThienKhoi);

  const viTriThienViet = dichCung(5, 5 - viTriThienKhoi);
  diaBan.nhapSao(viTriThienViet, saoThienViet);

  const viTriThienHu = dichCung(7, chiNam - 1);
  diaBan.nhapSao(viTriThienHu, saoThienHu);

  const viTriThienKhoc = dichCung(7, -chiNam + 1);
  diaBan.nhapSao(viTriThienKhoc, saoThienKhoc);

  const viTriThienTai = dichCung(diaBan.cungMenh, chiNam - 1);
  diaBan.nhapSao(viTriThienTai, saoThienTai);

  const viTriThienTho = dichCung(diaBan.cungThan, chiNam - 1);
  diaBan.nhapSao(viTriThienTho, saoThienTho);

  const viTriHongLoan = dichCung(4, -chiNam + 1);
  diaBan.nhapSao(viTriHongLoan, saoHongLoan);

  const viTriThienHy = dichCung(viTriHongLoan, 6);
  diaBan.nhapSao(viTriThienHy, saoThienHy);

  // #  Thiên Quan - Thiên Phúc
  const [viTriThienQuan, viTriThienPhuc] = timThienQuanThienPhuc(canNam);
  diaBan.nhapSao(viTriThienQuan, saoThienQuan);
  diaBan.nhapSao(viTriThienPhuc, saoThienPhuc);

  const viTriThienHinh = dichCung(10, tt - 1);
  diaBan.nhapSao(viTriThienHinh, saoThienHinh);

  const viTriThienRieu = dichCung(viTriThienHinh, 4);
  diaBan.nhapSao(viTriThienRieu, saoThienRieu, saoThienY);

  const viTriCoThan = timCoThan(chiNam);
  diaBan.nhapSao(viTriCoThan, saoCoThan);

  const viTriQuaTu = dichCung(viTriCoThan, -4);
  diaBan.nhapSao(viTriQuaTu, saoQuaTu);

  const viTriVanTinh = dichCung(viTriKinhDuong, 2);
  diaBan.nhapSao(viTriVanTinh, saoVanTinh);

  const viTriDuongPhu = dichCung(viTriVanTinh, 2);
  diaBan.nhapSao(viTriDuongPhu, saoDuongPhu);

  const viTriQuocAn = dichCung(viTriDuongPhu, 3);
  diaBan.nhapSao(viTriQuocAn, saoQuocAn);

  // # Thai phụ - Phong Cáo
  const viTriThaiPhu = dichCung(viTriVanKhuc, 2);
  diaBan.nhapSao(viTriThaiPhu, saoThaiPhu);

  const viTriPhongCao = dichCung(viTriVanKhuc, -2);
  diaBan.nhapSao(viTriPhongCao, saoPhongCao);

  // # Thiên giải - Địa giải
  // #    Theo cụ Thiên Lương: Lấy cung Thân làm tháng Giêng, đếm thuận nhưng
  // #    nhảy cung là Thiên giải.Một số trang web đếm nhưng không nhảy cung ???
  // #    Liệu phương cách nào đúng ?
  const viTriThienGiai = dichCung(9, 2 * tt - 2);
  diaBan.nhapSao(viTriThienGiai, saoThienGiai);

  const viTriDiaGiai = dichCung(viTriTaPhu, 3);
  diaBan.nhapSao(viTriDiaGiai, saoDiaGiai);

  // # Thiên la - Địa võng, Thiên thương - Thiên sứ
  const viTriThienLa = 5;
  diaBan.nhapSao(viTriThienLa, saoThienLa);

  const viTriDiaVong = 11;
  diaBan.nhapSao(viTriDiaVong, saoDiaVong);

  const viTriThienThuong = diaBan.cungNoboc;
  diaBan.nhapSao(viTriThienThuong, saoThienThuong);

  const viTriThienSu = diaBan.cungTatAch;
  diaBan.nhapSao(viTriThienSu, saoThienSu);

  // # Vòng Thiên mã
  const viTriThienMa = timThienMa(chiNam);
  diaBan.nhapSao(viTriThienMa, saoThienMa);

  const viTriHoaCai = dichCung(viTriThienMa, 2);
  diaBan.nhapSao(viTriHoaCai, saoHoaCai);

  const viTriKiepSat = dichCung(viTriThienMa, 3);
  diaBan.nhapSao(viTriKiepSat, saoKiepSat);

  const viTriDaoHoa = dichCung(viTriKiepSat, 4);
  diaBan.nhapSao(viTriDaoHoa, saoDaoHoa);

  // # Phá toái
  const viTriPhaToai = timPhaToai(chiNam);
  diaBan.nhapSao(viTriPhaToai, saoPhaToai);

  // # Đẩu quân
  const viTriDauQuan = dichCung(chiNam, -tt + gioSinh);
  diaBan.nhapSao(viTriDauQuan, saoDauQuan);

  let viTriHoaLoc: number;
  let viTriHoaQuyen: number;
  let viTriHoaKhoa: number;
  let viTriHoaKy: number;
  let viTriLuuHa: number;
  let viTriThienTru: number;
  let viTriTuan1: number;
  let viTriTuan2: number;
  let viTriTriet1: number;
  let viTriTriet2: number;

  if (canNam === 1) {
    viTriHoaLoc = viTriLiemTrinh;
    viTriHoaQuyen = viTriPhaQuan;
    viTriHoaKhoa = viTriVuKhuc;
    viTriHoaKy = vitriThaiDuong;
  } else if (canNam === 2) {
    viTriHoaLoc = viTriThienCo;
    viTriHoaQuyen = viTriThienLuong;
    viTriHoaKhoa = viTriTuVi;
    viTriHoaKy = viTriThaiAm;
  } else if (canNam === 3) {
    viTriHoaLoc = viTriThienDong;
    viTriHoaQuyen = viTriThienCo;
    viTriHoaKhoa = viTriVanXuong;
    viTriHoaKy = viTriLiemTrinh;
  } else if (canNam === 4) {
    viTriHoaLoc = viTriThaiAm;
    viTriHoaQuyen = viTriThienDong;
    viTriHoaKhoa = viTriThienCo;
    viTriHoaKy = viTriCuMon;
  } else if (canNam === 5) {
    viTriHoaLoc = viTriThamLang;
    viTriHoaQuyen = viTriThaiAm;
    viTriHoaKhoa = viTriHuuBat;
    viTriHoaKy = viTriThienCo;
  } else if (canNam === 6) {
    viTriHoaLoc = viTriVuKhuc;
    viTriHoaQuyen = viTriThamLang;
    viTriHoaKhoa = viTriThienLuong;
    viTriHoaKy = viTriVanKhuc;
  } else if (canNam === 7) {
    viTriHoaLoc = vitriThaiDuong;
    viTriHoaQuyen = viTriVuKhuc;
    viTriHoaKhoa = viTriThienDong;
    viTriHoaKy = viTriThaiAm;
  } else if (canNam === 8) {
    viTriHoaLoc = viTriCuMon;
    viTriHoaQuyen = vitriThaiDuong;
    viTriHoaKhoa = viTriVanKhuc;
    viTriHoaKy = viTriVanXuong;
  } else if (canNam === 9) {
    viTriHoaLoc = viTriThienLuong;
    viTriHoaQuyen = viTriTuVi;
    viTriHoaKhoa = viTriThienPhu;
    viTriHoaKy = viTriVuKhuc;
  } else if (canNam === 10) {
    viTriHoaLoc = viTriPhaQuan;
    viTriHoaQuyen = viTriCuMon;
    viTriHoaKhoa = viTriThaiAm;
    viTriHoaKy = viTriThamLang;
  }

  diaBan.nhapSao(viTriHoaLoc, saoHoaLoc);
  diaBan.nhapSao(viTriHoaQuyen, saoHoaQuyen);
  diaBan.nhapSao(viTriHoaKhoa, saoHoaKhoa);
  diaBan.nhapSao(viTriHoaKy, saoHoaKy);

  [viTriLuuHa, viTriThienTru] = timLuuTru(canNam);
  diaBan.nhapSao(viTriLuuHa, saoLuuHa);
  diaBan.nhapSao(viTriThienTru, saoThienTru);

  const ketThucTuan = dichCung(chiNam, 10 - canNam);
  viTriTuan1 = dichCung(ketThucTuan, 1);
  viTriTuan2 = dichCung(viTriTuan1, 1);
  diaBan.nhapTuan(viTriTuan1, viTriTuan2);

  [viTriTriet1, viTriTriet2] = timTriet(canNam);
  diaBan.nhapTriet(viTriTriet1, viTriTriet2);

  return diaBan;
}
