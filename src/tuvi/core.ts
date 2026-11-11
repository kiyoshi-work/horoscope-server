/**
 * Hằng số & tiện ích Can Chi – Ngũ hành dùng chung cho engine Tử Vi.
 * Quy ước chỉ số: Can 1..10 (Giáp..Quý), Chi 1..12 (Tý..Hợi), địa bàn cung = chỉ số Chi.
 */

export type Hanh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
export type DacTinh = 'M' | 'V' | 'Đ' | 'B' | 'H';

export const CAN = ['', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const CHI = ['', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
export const CHI_GIO = ['', '23h–1h', '1h–3h', '3h–5h', '5h–7h', '7h–9h', '9h–11h', '11h–13h', '13h–15h', '15h–17h', '17h–19h', '19h–21h', '21h–23h'];

export const HANH_CAN: Hanh[] = [null, 'Mộc', 'Mộc', 'Hỏa', 'Hỏa', 'Thổ', 'Thổ', 'Kim', 'Kim', 'Thủy', 'Thủy'];
export const HANH_CHI: Hanh[] = [null, 'Thủy', 'Thổ', 'Mộc', 'Mộc', 'Thổ', 'Hỏa', 'Hỏa', 'Thổ', 'Kim', 'Kim', 'Thổ', 'Thủy'];
export const HANH_CODE: Record<string, Hanh> = { K: 'Kim', M: 'Mộc', T: 'Thủy', H: 'Hỏa', O: 'Thổ' };

export const CUC: Record<Hanh, { so: number; ten: string }> = {
  Thủy: { so: 2, ten: 'Thủy nhị cục' },
  Mộc: { so: 3, ten: 'Mộc tam cục' },
  Kim: { so: 4, ten: 'Kim tứ cục' },
  Thổ: { so: 5, ten: 'Thổ ngũ cục' },
  Hỏa: { so: 6, ten: 'Hỏa lục cục' },
};

/** Tên 12 cung chức, theo thứ tự nghịch từ Mệnh (Mệnh, Phụ Mẫu ở cung kế thuận...). */
export const TEN_CUNG = ['Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'];

/** Dịch cung: kết quả luôn trong 1..12 */
export function dich(cung: number, ...steps: number[]): number {
  let c = cung;
  for (const s of steps) c += s;
  return ((((c - 1) % 12) + 12) % 12) + 1;
}
export const mod = (n: number, m: number) => ((n % m) + m) % m;
export const canIdx = (n: number) => mod(n - 1, 10) + 1;

/** Tương quan ngũ hành giữa a và b, nhìn từ a. */
export type QuanHe = 'hoa' | 'sinh' | 'duocSinh' | 'khac' | 'biKhac';
const SINH: Record<Hanh, Hanh> = { Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim', Kim: 'Thủy', Thủy: 'Mộc' };
const KHAC: Record<Hanh, Hanh> = { Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim', Kim: 'Mộc' };
export function quanHe(a: Hanh, b: Hanh): QuanHe {
  if (a === b) return 'hoa';
  if (SINH[a] === b) return 'sinh';
  if (SINH[b] === a) return 'duocSinh';
  if (KHAC[a] === b) return 'khac';
  return 'biKhac';
}

/** Ngũ hành nạp âm của cặp Can Chi (Lục thập hoa giáp). */
const NAP_AM: [Hanh, string][] = [
  ['Kim', 'Hải Trung Kim'], ['Hỏa', 'Lư Trung Hỏa'], ['Mộc', 'Đại Lâm Mộc'], ['Thổ', 'Lộ Bàng Thổ'], ['Kim', 'Kiếm Phong Kim'],
  ['Hỏa', 'Sơn Đầu Hỏa'], ['Thủy', 'Giản Hạ Thủy'], ['Thổ', 'Thành Đầu Thổ'], ['Kim', 'Bạch Lạp Kim'], ['Mộc', 'Dương Liễu Mộc'],
  ['Thủy', 'Tuyền Trung Thủy'], ['Thổ', 'Ốc Thượng Thổ'], ['Hỏa', 'Tích Lịch Hỏa'], ['Mộc', 'Tùng Bách Mộc'], ['Thủy', 'Trường Lưu Thủy'],
  ['Kim', 'Sa Trung Kim'], ['Hỏa', 'Sơn Hạ Hỏa'], ['Mộc', 'Bình Địa Mộc'], ['Thổ', 'Bích Thượng Thổ'], ['Kim', 'Kim Bạch Kim'],
  ['Hỏa', 'Phú Đăng Hỏa'], ['Thủy', 'Thiên Hà Thủy'], ['Thổ', 'Đại Trạch Thổ'], ['Kim', 'Thoa Xuyến Kim'], ['Mộc', 'Tang Đố Mộc'],
  ['Thủy', 'Đại Khê Thủy'], ['Thổ', 'Sa Trung Thổ'], ['Hỏa', 'Thiên Thượng Hỏa'], ['Mộc', 'Thạch Lựu Mộc'], ['Thủy', 'Đại Hải Thủy'],
];
/** Chỉ số 0..59 trong Lục thập hoa giáp */
export function giapTy(can: number, chi: number): number {
  for (let i = 0; i < 60; i++) if (i % 10 === can - 1 && i % 12 === chi - 1) return i;
  throw new Error(`Can ${can} – Chi ${chi} không cùng âm dương`);
}
export function napAm(can: number, chi: number): { hanh: Hanh; ten: string } {
  const [hanh, ten] = NAP_AM[Math.floor(giapTy(can, chi) / 2)];
  return { hanh, ten };
}

/** Can của cung địa bàn theo "Ngũ hổ độn": Dần nhận can tháng Giêng, đi thuận; Tý Sửu nối tiếp sau Hợi. */
export function canCung(canNam: number, chi: number): number {
  const canGieng = canIdx(canNam * 2 + 1); // Giáp Kỷ → Bính, Ất Canh → Mậu ...
  return canIdx(canGieng + mod(chi - 3, 12));
}

export const xung = (c: number) => dich(c, 6);
export const tamHop = (c: number) => [dich(c, 4), dich(c, 8)];
export const nhiHop = (c: number) => mod(14 - c, 12) + 1;
export const giap = (c: number) => [dich(c, -1), dich(c, 1)];
export const tamPhuong = (c: number) => [c, xung(c), ...tamHop(c)];

/** Mùa sinh theo tháng âm lịch */
export function muaSinh(thang: number): 'Xuân' | 'Hạ' | 'Thu' | 'Đông' {
  return (['Xuân', 'Hạ', 'Thu', 'Đông'] as const)[Math.floor((thang - 1) / 3)];
}
