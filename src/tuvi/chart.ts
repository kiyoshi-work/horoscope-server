/**
 * Lập lá số Tử Vi theo "Tử Vi Chính Biện" (Phần I – Cách an số, an sao, an Thân, lưu hạn).
 * Viết lại từ bản port lasotuvi, sửa các điểm sai lệch so với sách:
 *  - Thai/Dưỡng vòng Tràng Sinh bị đảo; Hỏa/Linh tuổi Tỵ Dậu Sửu bị đảo; Phá Toái sai tuổi.
 *  - Thiên Giải: lấy Thân làm tháng Giêng đếm thuận (không nhảy cung).
 *  - Khôi Việt tuổi Mậu, Canh, Nhâm, Đinh theo bài "Giáp Mậu nhị Ngưu Dương…".
 *  - Tìm Cục khi Mệnh ở Tý/Sửu (lỗi số dư âm trong JS).
 *  - Mệnh chủ / Thân chủ tra theo Chi năm sinh.
 *  - Bổ sung Thiên Khố, Lưu Tù, Đồng hạn, can các cung, sao không còn dùng chung giữa các lá số.
 */
import { S2L, L2S, jdFromDate } from './calendar';
import {
  CAN, CHI, CUC, CHI_GIO, DacTinh, HANH_CHI, HANH_CODE, Hanh, TEN_CUNG,
  canCung, canIdx, dich, mod, napAm,
} from './core';
import { CATALOG, StarDef } from './kb';

export interface ChartInput {
  ten?: string;
  gioiTinh: 'nam' | 'nu';
  ngay: number;
  thang: number;
  nam: number;
  /** Chi giờ sinh 1..12 (Tý..Hợi) */
  gio: number;
  lich?: 'duong' | 'am';
  /** Chỉ dùng khi nhập âm lịch */
  thangNhuan?: boolean;
  /** Xử lý tháng nhuận: 'giu' = tính như tháng chính; 'tach' = sau ngày 15 tính sang tháng sau */
  cachTinhNhuan?: 'giu' | 'tach';
  timeZone?: number;
}

export interface StarInChart {
  id: string;
  ten: string;
  hanh: Hanh;
  loai: string;
  nhom: 'cat' | 'hung' | 'trung';
  dacTinh: DacTinh | null;
  /** Với sao lưu: id sao gốc */
  base?: string;
}

export interface Palace {
  chi: number;
  chiTen: string;
  hanh: Hanh;
  can: number;
  canTen: string;
  amDuong: 1 | -1;
  /** Tên cung chức (Mệnh, Phụ Mẫu...) */
  ten: string;
  /** Thứ tự cung chức 0..11 kể từ Mệnh */
  thuTu: number;
  isThan: boolean;
  stars: StarInChart[];
  tuan: boolean;
  triet: boolean;
  /** Đại hạn: tuổi bắt đầu (tuổi mụ) */
  daiHan: number;
  /** Chi của các năm tiểu hạn rơi vào cung (năm có chi này) */
  tieuHan: number;
  /** Đồng hạn (1-12 tuổi) */
  dongHan: number | null;
  vcd: boolean;
}

export interface Chart {
  input: Required<Omit<ChartInput, 'thangNhuan'>> & { thangNhuan: boolean };
  thienBan: ThienBan;
  palaces: Palace[]; // chỉ số 1..12 theo Chi, phần tử 0 = null
}

export interface ThienBan {
  ten: string;
  gioiTinh: 'nam' | 'nu';
  duongLich: { ngay: number; thang: number; nam: number };
  amLich: { ngay: number; thang: number; nam: number; nhuan: boolean; thangTinh: number };
  canNam: number; chiNam: number; canThang: number; chiThang: number; canNgay: number; chiNgay: number; canGio: number; chiGio: number;
  canChi: { nam: string; thang: string; ngay: string; gio: string };
  gioKhoang: string;
  amDuongNam: 1 | -1;
  amDuongTen: string; // Dương Nam / Âm Nữ...
  thuanNghich: 1 | -1; // chiều đại hạn & vòng Bác sĩ, Tràng sinh
  menh: { hanh: Hanh; napAm: string };
  cuc: { hanh: Hanh; so: number; ten: string };
  cungMenh: number;
  cungThan: number;
  thanCu: string;
  menhChu: string;
  thanChu: string;
  amDuongLy: { thuan: boolean; text: string };
}

// ───────────────────────────── Bảng đắc tính (miếu/vượng/đắc/bình/hãm) theo Chi 1..12
const DAC_TINH: Record<string, string> = {
  'tu-vi': 'BĐMBVMMĐMBVB',
  'liem-trinh': 'VĐVHMHVĐVHMH',
  'thien-dong': 'VHMĐHĐHHMHHĐ',
  'vu-khuc': 'VMVĐMHVMVĐMH',
  'thai-duong': 'HĐVVVMMĐHHHH',
  'thien-co': 'ĐĐHMMVĐĐVMMH',
  'thien-phu': 'MBMBVĐMĐMBVĐ',
  'thai-am': 'VĐHHHHHĐVMMM',
  'tham-lang': 'HMĐHVHHMĐHVH',
  'cu-mon': 'VHVMHHVHĐMHĐ',
  'thien-tuong': 'VĐMHVĐVĐMHVĐ',
  'thien-luong': 'VĐVVMHMĐVHMH',
  'that-sat': 'MĐMHHVMĐMHHV',
  'pha-quan': 'MVHHĐHMVHHĐH',
  'da-la': 'HĐHHĐHHĐHHĐH',
  'kinh-duong': 'HĐHHĐHHĐHHĐH',
  'linh-tinh': 'HHĐĐĐĐĐHHHHH',
  'hoa-tinh': 'HHĐĐĐĐĐHHHHH',
  'van-xuong': 'HĐHĐHĐHĐHHĐĐ',
  'van-khuc': 'HĐHĐHĐHĐHHĐĐ',
  'dia-khong': 'HHĐHHĐHHĐHHĐ',
  'dia-kiep': 'HHĐHHĐHHĐHHĐ',
  'hoa-ky': '-Đ--Đ--Đ--Đ-',
  'dai-hao': '--ĐĐ----ĐĐ--',
  'tieu-hao': '--ĐĐ----ĐĐ--',
  'thien-khoc': 'ĐĐ-Đ--ĐĐ-Đ--',
  'thien-hu': 'ĐĐ-Đ--ĐĐ-Đ--',
  'thien-ma': '--Đ--Đ--ĐĐ--',
  'thien-hinh': '--ĐĐ----ĐĐ--',
  'thien-rieu': '--ĐĐ-----ĐĐ-',
};
function dacTinh(id: string, chi: number): DacTinh | null {
  const row = DAC_TINH[id];
  if (!row) return null;
  const c = [...row][chi - 1];
  return c === '-' ? null : (c as DacTinh);
}

// ───────────────────────────── Bảng tra theo Can / Chi năm
// Khôi – Việt: Giáp Mậu Sửu Mùi, Ất Kỷ Tý Thân, Canh Tân Ngọ Dần, Nhâm Quý Mão Tỵ, Bính Đinh Hợi Dậu
const KHOI = [0, 2, 1, 12, 12, 2, 1, 7, 7, 4, 4];
const VIET = [0, 8, 9, 10, 10, 8, 9, 3, 3, 6, 6];
// Lộc Tồn
export const LOC_TON = [0, 3, 4, 6, 7, 6, 7, 9, 10, 12, 1];
// Thiên Quan, Thiên Phúc
const THIEN_QUAN = [0, 8, 5, 6, 3, 4, 10, 12, 10, 11, 7];
const THIEN_PHUC = [0, 10, 9, 1, 12, 4, 3, 7, 6, 7, 6];
// Lưu Hà, Thiên Trù
const LUU_HA = [0, 10, 11, 8, 5, 6, 7, 9, 4, 12, 3];
const THIEN_TRU = [0, 6, 7, 1, 6, 7, 9, 3, 7, 10, 11];
// Triệt: Giáp Kỷ Thân Dậu, Ất Canh Ngọ Mùi, Bính Tân Thìn Tỵ, Đinh Nhâm Dần Mão, Mậu Quý Tý Sửu
const TRIET: [number, number][] = [null, [9, 10], [7, 8], [5, 6], [3, 4], [1, 2]];
export const trietCua = (can: number): [number, number] => TRIET[((can - 1) % 5) + 1];
// Tứ hóa: [Lộc, Quyền, Khoa, Kỵ]
export const TU_HOA: string[][] = [
  null,
  ['liem-trinh', 'pha-quan', 'vu-khuc', 'thai-duong'],
  ['thien-co', 'thien-luong', 'tu-vi', 'thai-am'],
  ['thien-dong', 'thien-co', 'van-xuong', 'liem-trinh'],
  ['thai-am', 'thien-dong', 'thien-co', 'cu-mon'],
  ['tham-lang', 'thai-am', 'huu-bat', 'thien-co'],
  ['vu-khuc', 'tham-lang', 'thien-luong', 'van-khuc'],
  ['thai-duong', 'vu-khuc', 'thien-dong', 'thai-am'],
  ['cu-mon', 'thai-duong', 'van-khuc', 'van-xuong'],
  ['thien-luong', 'tu-vi', 'thien-phu', 'vu-khuc'],
  ['pha-quan', 'cu-mon', 'thai-am', 'tham-lang'],
];
// Mệnh chủ / Thân chủ theo Chi năm sinh
const MENH_CHU = ['', 'Tham Lang', 'Cự Môn', 'Lộc Tồn', 'Văn Khúc', 'Liêm Trinh', 'Vũ Khúc', 'Phá Quân', 'Vũ Khúc', 'Liêm Trinh', 'Văn Khúc', 'Lộc Tồn', 'Cự Môn'];
const THAN_CHU = ['', 'Hỏa Tinh', 'Thiên Tướng', 'Thiên Lương', 'Thiên Đồng', 'Văn Xương', 'Thiên Cơ', 'Hỏa Tinh', 'Thiên Tướng', 'Thiên Lương', 'Thiên Đồng', 'Văn Xương', 'Thiên Cơ'];

/** Tam hợp cục của chi: 0 Thân Tý Thìn, 1 Tỵ Dậu Sửu, 2 Dần Ngọ Tuất, 3 Hợi Mão Mùi */
export const tamHopNhom = (chi: number) => (chi - 1) % 4;
/** Thiên Mã: Thân Tý Thìn → Dần, Tỵ Dậu Sửu → Hợi, Dần Ngọ Tuất → Thân, Hợi Mão Mùi → Tỵ */
export const thienMaCua = (chi: number) => [3, 12, 9, 6][tamHopNhom(chi)];

/** Tìm vị trí Tử Vi theo số cục và ngày sinh âm lịch */
export function viTriTuVi(cucSo: number, ngay: number): number {
  let k = 1;
  while (cucSo * k < ngay) k++;
  const lech = cucSo * k - ngay;
  const goc = dich(3, k - 1);
  return lech % 2 === 1 ? dich(goc, -lech) : dich(goc, lech);
}

/** Đổi ngày sinh sang âm lịch + can chi */
export function chuanHoaNgaySinh(input: ChartInput) {
  const tz = input.timeZone ?? 7;
  let dl: [number, number, number];
  let al: [number, number, number, number];
  if ((input.lich ?? 'duong') === 'duong') {
    dl = [input.ngay, input.thang, input.nam];
    al = S2L(input.ngay, input.thang, input.nam, tz);
  } else {
    const d = L2S(input.ngay, input.thang, input.nam, input.thangNhuan ? 1 : 0, tz);
    if (!d[0]) throw new Error('Tháng nhuận không hợp lệ cho năm âm lịch đã nhập');
    dl = d;
    al = [input.ngay, input.thang, input.nam, input.thangNhuan ? 1 : 0];
  }
  const [ngayAm, thangAm, namAm, nhuan] = al;
  let thangTinh = thangAm;
  if (nhuan && (input.cachTinhNhuan ?? 'giu') === 'tach' && ngayAm > 15) thangTinh = (thangAm % 12) + 1;
  const jd = jdFromDate(dl[0], dl[1], dl[2]);
  const canNam = canIdx(namAm + 7); // 1984 Giáp
  const chiNam = mod(namAm + 8, 12) + 1; // 1984 Tý
  const canThang = canIdx(canNam * 2 + 1 + thangAm - 1); // tháng Giêng: Giáp Kỷ → Bính
  const chiThang = dich(3, thangAm - 1);
  const canNgay = mod(jd + 9, 10) + 1;
  const chiNgay = mod(jd + 1, 12) + 1;
  const canGio = canIdx((canNgay - 1) * 2 + 1 + input.gio - 1); // ngày Giáp Kỷ giờ Tý là Giáp Tý
  return { dl, ngayAm, thangAm, namAm, nhuan: !!nhuan, thangTinh, canNam, chiNam, canThang, chiThang, canNgay, chiNgay, canGio };
}

function makeStar(def: StarDef, chi: number): StarInChart {
  return {
    id: def.id,
    ten: def.ten,
    hanh: HANH_CODE[def.hanh],
    loai: def.loai,
    nhom: def.nhom,
    dacTinh: dacTinh(def.base ?? def.id, chi),
    ...(def.base ? { base: def.base } : {}),
  };
}

export function lapLaSo(raw: ChartInput): Chart {
  const input = {
    ten: raw.ten || 'Đương số',
    gioiTinh: raw.gioiTinh,
    ngay: +raw.ngay,
    thang: +raw.thang,
    nam: +raw.nam,
    gio: +raw.gio,
    lich: raw.lich ?? 'duong',
    thangNhuan: !!raw.thangNhuan,
    cachTinhNhuan: raw.cachTinhNhuan ?? 'giu',
    timeZone: raw.timeZone ?? 7,
  } as Chart['input'];
  if (!(input.gio >= 1 && input.gio <= 12)) throw new Error('Giờ sinh phải là chi 1..12');
  const ns = chuanHoaNgaySinh(input);
  const { ngayAm, canNam, chiNam } = ns;
  const tt = ns.thangTinh;
  const gs = input.gio;
  const gt = input.gioiTinh === 'nam' ? 1 : -1;
  const amDuongNam = (canNam % 2 === 1 ? 1 : -1) as 1 | -1;
  const thuanNghich = (gt * amDuongNam) as 1 | -1;

  // Mệnh: Dần tháng Giêng thuận đến tháng sinh, nghịch giờ sinh. Thân: thuận cả tháng và giờ.
  const cungMenh = dich(3, tt - 1, -(gs - 1));
  const cungThan = dich(3, tt - 1, gs - 1);
  const cucHanh = napAm(canCung(canNam, cungMenh), cungMenh).hanh;
  const cuc = { hanh: cucHanh, ...CUC[cucHanh] };

  const palaces: Palace[] = [null];
  for (let chi = 1; chi <= 12; chi++) {
    const c = canCung(canNam, chi);
    palaces.push({
      chi,
      chiTen: CHI[chi],
      hanh: HANH_CHI[chi],
      can: c,
      canTen: CAN[c],
      amDuong: chi % 2 === 1 ? 1 : -1,
      ten: '',
      thuTu: 0,
      isThan: chi === cungThan,
      stars: [],
      tuan: false,
      triet: false,
      daiHan: 0,
      tieuHan: 0,
      dongHan: null,
      vcd: false,
    });
  }
  // Cung chức: Mệnh, rồi Phụ Mẫu ở cung kế THUẬN (Mệnh + 1), Phúc Đức + 2 …
  for (let i = 0; i < 12; i++) {
    const p = palaces[dich(cungMenh, i)];
    p.ten = TEN_CUNG[i];
    p.thuTu = i;
  }

  const byName = (ten: string) => palaces.find((p) => p && p.ten === ten).chi;
  const put = (chi: number, ...ids: string[]) => {
    for (const id of ids) palaces[chi].stars.push(makeStar(CATALOG.byId[id], chi));
  };

  // ── 14 chính tinh
  const tuVi = viTriTuVi(cuc.so, ngayAm);
  const pos: Record<string, number> = {};
  const vongTuVi: [string, number][] = [['tu-vi', 0], ['thien-co', -1], ['thai-duong', -3], ['vu-khuc', -4], ['thien-dong', -5], ['liem-trinh', -8]];
  for (const [id, d] of vongTuVi) pos[id] = dich(tuVi, d);
  const thienPhu = dich(6 - tuVi); // đối xứng Tử Vi qua trục Dần – Thân
  const vongPhu: [string, number][] = [['thien-phu', 0], ['thai-am', 1], ['tham-lang', 2], ['cu-mon', 3], ['thien-tuong', 4], ['thien-luong', 5], ['that-sat', 6], ['pha-quan', 10]];
  for (const [id, d] of vongPhu) pos[id] = dich(thienPhu, d);

  // ── Sao theo giờ
  pos['van-khuc'] = dich(5, gs - 1); // Thìn gọi Tý, thuận
  pos['van-xuong'] = dich(11, -(gs - 1)); // Tuất gọi Tý, nghịch
  pos['dia-kiep'] = dich(12, gs - 1); // Hợi gọi Tý, thuận
  pos['dia-khong'] = dich(12, -(gs - 1));
  pos['thai-phu'] = dich(pos['van-khuc'], 2);
  pos['phong-cao'] = dich(pos['van-khuc'], -2);
  pos['an-quang'] = dich(pos['van-xuong'], ngayAm - 2); // Xương làm mồng 1, thuận ngày, lùi 1
  pos['thien-quy'] = dich(pos['van-khuc'], -(ngayAm - 2)); // Khúc làm mồng 1, nghịch ngày, lùi 1

  // ── Sao theo tháng
  pos['ta-phu'] = dich(5, tt - 1);
  pos['huu-bat'] = dich(11, -(tt - 1));
  pos['tam-thai'] = dich(pos['ta-phu'], ngayAm - 1);
  pos['bat-toa'] = dich(pos['huu-bat'], -(ngayAm - 1));
  pos['thien-hinh'] = dich(10, tt - 1);
  pos['thien-rieu'] = dich(2, tt - 1);
  pos['thien-y'] = pos['thien-rieu'];
  pos['thien-giai'] = dich(9, tt - 1);
  pos['dia-giai'] = dich(8, tt - 1);
  pos['thien-kho'] = dich(3, -(tt - 1));

  // ── Sao theo Can năm
  pos['loc-ton'] = LOC_TON[canNam];
  pos['kinh-duong'] = dich(pos['loc-ton'], 1);
  pos['da-la'] = dich(pos['loc-ton'], -1);
  pos['thien-khoi'] = KHOI[canNam];
  pos['thien-viet'] = VIET[canNam];
  pos['quoc-an'] = dich(pos['loc-ton'], 8);
  pos['duong-phu'] = dich(pos['loc-ton'], -7);
  pos['van-tinh'] = dich(pos['loc-ton'], 3);
  pos['thien-quan'] = THIEN_QUAN[canNam];
  pos['thien-phuc'] = THIEN_PHUC[canNam];
  pos['luu-ha'] = LUU_HA[canNam];
  pos['thien-tru'] = THIEN_TRU[canNam];

  // ── Sao theo Chi năm
  pos['long-tri'] = dich(5, chiNam - 1);
  pos['phuong-cac'] = dich(11, -(chiNam - 1));
  pos['giai-than'] = pos['phuong-cac'];
  pos['thien-khoc'] = dich(7, -(chiNam - 1));
  pos['thien-hu'] = dich(7, chiNam - 1);
  pos['hong-loan'] = dich(4, -(chiNam - 1));
  pos['thien-hy'] = dich(pos['hong-loan'], 6);
  pos['thien-duc'] = dich(10, chiNam - 1);
  pos['nguyet-duc'] = dich(6, chiNam - 1);
  pos['thien-tai'] = dich(cungMenh, chiNam - 1);
  pos['thien-tho'] = dich(cungThan, chiNam - 1);
  const nhom = tamHopNhom(chiNam); // 0 Thân Tý Thìn, 1 Tỵ Dậu Sửu, 2 Dần Ngọ Tuất, 3 Hợi Mão Mùi
  pos['thien-ma'] = thienMaCua(chiNam);
  pos['hoa-cai'] = [5, 2, 11, 8][nhom];
  pos['kiep-sat'] = [6, 3, 12, 9][nhom];
  pos['dao-hoa'] = [10, 7, 4, 1][nhom];
  pos['luu-tu'] = [1, 10, 7, 4][nhom]; // sách in "Tỵ Dậu Sửu tại Sửu" – theo quy luật tam hợp (đế vượng) lấy Dậu
  pos['pha-toai'] = [6, 2, 10][mod(chiNam - 1, 3)]; // Tý Ngọ Mão Dậu: Tỵ; Dần Thân Tỵ Hợi: Dậu; Thìn Tuất Sửu Mùi: Sửu
  const coThan = [6, 9, 12, 3][Math.floor(mod(chiNam - 3, 12) / 3)]; // Dần Mão Thìn → Tỵ …
  pos['co-than'] = coThan;
  pos['qua-tu'] = dich(coThan, -4);
  pos['dau-quan'] = dich(chiNam, -(tt - 1), gs - 1);
  pos['thien-la'] = 5;
  pos['dia-vong'] = 11;

  // ── Hỏa – Linh
  const khoiHL: [number, number][] = [[3, 11], [4, 11], [2, 4], [10, 11]]; // [Hỏa, Linh] khởi
  const [kh, kl] = khoiHL[nhom];
  pos['hoa-tinh'] = dich(kh, thuanNghich * (gs - 1));
  pos['linh-tinh'] = dich(kl, -thuanNghich * (gs - 1));

  for (const [id, chi] of Object.entries(pos)) put(chi, id);

  // ── Tứ hóa
  TU_HOA[canNam].forEach((sao, i) => put(pos[sao], ['hoa-loc', 'hoa-quyen', 'hoa-khoa', 'hoa-ky'][i]));

  // ── Vòng Thái Tuế (luôn thuận)
  const vongTT = ['thai-tue', 'thieu-duong', 'tang-mon', 'thieu-am', 'quan-phu', 'tu-phu', 'tue-pha', 'long-duc', 'bach-ho', 'phuc-duc', 'dieu-khach', 'truc-phu'];
  vongTT.forEach((id, i) => put(dich(chiNam, i), id));
  put(dich(chiNam, 1), 'thien-khong');

  // ── Vòng Bác Sĩ (Dương nam Âm nữ thuận)
  const vongBS = ['bac-si', 'luc-si', 'thanh-long', 'tieu-hao', 'tuong-quan', 'tau-thu', 'phi-liem', 'hy-than', 'benh-phu', 'dai-hao', 'phuc-binh', 'quan-phu-bs'];
  vongBS.forEach((id, i) => put(dich(pos['loc-ton'], thuanNghich * i), id));

  // ── Vòng Tràng Sinh theo Cục
  const trangSinh = { Hỏa: 3, Mộc: 12, Kim: 6, Thủy: 9, Thổ: 9 }[cuc.hanh];
  const vongTS = ['trang-sinh', 'moc-duc', 'quan-doi', 'lam-quan', 'de-vuong', 'suy', 'benh', 'tu', 'mo', 'tuyet', 'thai', 'duong'];
  vongTS.forEach((id, i) => put(dich(trangSinh, thuanNghich * i), id));

  // ── Thiên Thương (Nô bộc), Thiên Sứ (Tật ách)
  put(byName('Nô Bộc'), 'thien-thuong');
  put(byName('Tật Ách'), 'thien-su');

  // ── Tuần, Triệt
  const tuanCuoi = dich(chiNam, 10 - canNam); // chi của ngày Quý trong con Giáp
  for (const c of [dich(tuanCuoi, 1), dich(tuanCuoi, 2)]) palaces[c].tuan = true;
  for (const c of trietCua(canNam)) palaces[c].triet = true;

  // ── Đại hạn, tiểu hạn, đồng hạn
  for (let chi = 1; chi <= 12; chi++) {
    const kc = mod(thuanNghich * (chi - cungMenh), 12);
    palaces[chi].daiHan = cuc.so + kc * 10;
  }
  const khoiTieuHan = [11, 8, 5, 2][nhom]; // năm sinh ghi ở: Thân Tý Thìn → Tuất; Tỵ Dậu Sửu → Mùi; Dần Ngọ Tuất → Thìn; Hợi Mão Mùi → Sửu
  for (let k = 0; k < 12; k++) palaces[dich(khoiTieuHan, gt * k)].tieuHan = dich(chiNam, k);
  const DONG_HAN = ['Mệnh', 'Tài Bạch', 'Tật Ách', 'Phu Thê', 'Phúc Đức', 'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tử Tức', 'Huynh Đệ', 'Phụ Mẫu', 'Điền Trạch'];
  DONG_HAN.forEach((ten, i) => (palaces[byName(ten)].dongHan = i + 1));

  for (let chi = 1; chi <= 12; chi++) palaces[chi].vcd = !palaces[chi].stars.some((s) => s.loai === 'chinh');

  // ── Thiên bàn
  const menh = napAm(canNam, chiNam);
  const amDuongTen = `${amDuongNam === 1 ? 'Dương' : 'Âm'} ${gt === 1 ? 'Nam' : 'Nữ'}`;
  const cungMenhAD = cungMenh % 2 === 1 ? 1 : -1;
  const thuanLy = cungMenhAD === amDuongNam;
  const thienBan: ThienBan = {
    ten: input.ten,
    gioiTinh: input.gioiTinh,
    duongLich: { ngay: ns.dl[0], thang: ns.dl[1], nam: ns.dl[2] },
    amLich: { ngay: ngayAm, thang: ns.thangAm, nam: ns.namAm, nhuan: ns.nhuan, thangTinh: tt },
    canNam, chiNam, canThang: ns.canThang, chiThang: ns.chiThang, canNgay: ns.canNgay, chiNgay: ns.chiNgay, canGio: ns.canGio, chiGio: gs,
    canChi: {
      nam: `${CAN[canNam]} ${CHI[chiNam]}`,
      thang: `${CAN[ns.canThang]} ${CHI[ns.chiThang]}`,
      ngay: `${CAN[ns.canNgay]} ${CHI[ns.chiNgay]}`,
      gio: `${CAN[ns.canGio]} ${CHI[gs]}`,
    },
    gioKhoang: CHI_GIO[gs],
    amDuongNam,
    amDuongTen,
    thuanNghich,
    menh: { hanh: menh.hanh, napAm: menh.ten },
    cuc: { hanh: cuc.hanh, so: cuc.so, ten: cuc.ten },
    cungMenh,
    cungThan,
    thanCu: palaces[cungThan].ten,
    menhChu: MENH_CHU[chiNam],
    thanChu: THAN_CHU[chiNam],
    amDuongLy: {
      thuan: thuanLy,
      text: thuanLy
        ? `Âm dương thuận lý (tuổi ${amDuongNam === 1 ? 'Dương' : 'Âm'}, Mệnh đóng cung ${cungMenhAD === 1 ? 'Dương' : 'Âm'})`
        : `Âm dương nghịch lý (tuổi ${amDuongNam === 1 ? 'Dương' : 'Âm'}, Mệnh đóng cung ${cungMenhAD === 1 ? 'Dương' : 'Âm'})`,
    },
  };
  return { input, thienBan, palaces };
}
