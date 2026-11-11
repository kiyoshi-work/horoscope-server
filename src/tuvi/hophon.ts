/**
 * Xem hợp hôn — đối chiếu hai lá số.
 *
 * Sách *Tử Vi Chính Biện* chỉ luận một lá số (cung Phu Thê, hạn hôn phối tr.138, các câu phú về vợ chồng),
 * không có phép đặt hai lá số cạnh nhau. Phần đối chiếu dưới đây lấy theo thực hành phổ biến, mỗi mục ghi
 * rõ nguồn: `sach` (có trang) · `thuc-hanh` (kinh nghiệm phổ biến, ngoài sách) · `tong-hop` (chương trình
 * tự tổng hợp từ kết quả luận giải của từng lá số).
 *
 *  Lớp 1 — Tuổi & bản mệnh: Chi (tam hợp, lục hợp, xung, hại, hình), Can (ngũ hợp, tương xung), nạp âm sinh khắc.
 *  Lớp 2 — Phu Thê ↔ Mệnh: cung Phu Thê người này mô tả "người sẽ lấy", đối chiếu với chính tinh thủ Mệnh người kia.
 *  Lớp 3 — Chồng lá số: chi năm sinh / cung Mệnh của người kia rơi vào cung nào trên lá số mình.
 *  Lớp 4 — Tứ Hóa giao thoa ("Thái Tuế nhập quái"): Tứ Hóa theo can năm sinh người kia bay vào cung nào của mình.
 *  Lớp 5 — Bổ sung: so 9 phương diện, tính khí chính tinh Mệnh, đường đời theo năm dương lịch.
 *  Thêm: các vấn đề nếu thành (cung Phu Thê hai bên), năm nên cưới (tr.138 + Kim Lâu).
 */
import { Chart, LOC_TON, Palace, TU_HOA } from './chart';
import { CAN, CHI, dich, mod, nhiHop, quanHe, tamHop, tamPhuong, xung } from './core';
import { CATALOG } from './kb';
import type { DanhGia, LuanGiai } from './analysis';
import { CT, thang100 } from './tongket';
import { diemCung } from './analysis';
import { tinhLuuNien } from './han';
import { Hit } from './rules';

export type Ben = 'nam' | 'nu';
export type Nguon = 'sach' | 'thuc-hanh' | 'tong-hop';
export interface BangChungHH { ten: string; ben: Ben; hits: Hit[]; cung: number[] }
export interface MucHH {
  tieuDe: string;
  noiDung: string;
  danhGia: DanhGia;
  diem: number;
  nguon: Nguon;
  trang?: number | string;
  /** chiều tác động: 'nam' = tác động lên lá số nam (do nữ mang đến)… */
  huong?: 'nam' | 'nu' | 'chung';
  bangChung: BangChungHH[];
}
export interface LopHH { key: string; ten: string; moTa: string; nguon: Nguon; trongSo: number; diem: number; muc: MucHH[] }
export interface VanDe { tieuDe: string; noiDung: string; danhGia: DanhGia; nguon: Nguon; trang?: number | string; ben: Ben | 'chung'; nhom: string; bangChung: BangChungHH[] }
export interface NamCuoi {
  nam: number; canChi: string; tuoiNam: number; tuoiNu: number;
  dauHieuNam: string[]; dauHieuNu: string[]; canhBao: string[];
  danhGia: DanhGia; xepHang: 'dep' | 'kha' | 'thuong' | 'tranh';
  bangChung: BangChungHH[];
}
export interface PhuongDienHH { key: string; tieuDe: string; nam: number; nu: number; ketLuan: string; danhGia: DanhGia }
export interface HopHonView {
  diem: number; xepLoai: string; tieuDe: string; tomTat: string[];
  lop: LopHH[];
  phuongDien: PhuongDienHH[];
  duongDoi: { nam: { nam: number; diem: number }[]; nu: { nam: number; diem: number }[]; giaiDoan: { tuNam: number; denNam: number; loai: 'cung-thinh' | 'cung-tram'; noiDung: string }[] };
  vanDe: VanDe[];
  namCuoi: NamCuoi[];
  ten: { nam: string; nu: string };
  /** Dấu của người kia đặt lên lá số mỗi người (chồng lá số + Tứ Hóa giao thoa) */
  chong: Record<Ben, DauChong[]>;
}
export interface DauChong { chi: number; nhan: string; loai: DanhGia; id?: string; tip: string }

interface Nguoi { ben: Ben; ten: string; chart: Chart; lg: LuanGiai }

// ───────────────────────────────────────────── tiện ích
const P = (n: Nguoi, ten: string): Palace => n.chart.palaces.find((p) => p && p.ten === ten);
const chinh = (p: Palace) => p.stars.filter((s) => s.loai === 'chinh');
const coSao = (p: Palace, ids: string[]) => p.stars.filter((s) => ids.includes(s.base || s.id));
const sangSao = (d: string | null) => d === 'M' || d === 'V' || d === 'Đ';
const G = (k: string) => CATALOG.groups[k] || [];
const SAT = G('luc-sat');
const lietKe = (a: string[]) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' và ' + a[a.length - 1]);
const clamp = (x: number) => Math.max(5, Math.min(95, Math.round(x)));
const dg = (d: number): DanhGia => (d > 0.25 ? 'cat' : d < -0.25 ? 'hung' : 'trung');
const tenCung = (n: Nguoi, chi: number) => n.chart.palaces[chi].ten;
const bc = (n: Nguoi, ten: string, chi: number[], ids: string[] = []): BangChungHH => ({
  ten, ben: n.ben,
  hits: chi.flatMap((c) => n.chart.palaces[c].stars.filter((s) => ids.includes(s.base || s.id)).map((s) => ({ chi: c, id: s.id }))),
  cung: chi,
});

/** Chính tinh của cung; vô chính diệu thì mượn chính tinh cung xung chiếu. */
function chinhTinhCua(n: Nguoi, p: Palace) {
  const own = chinh(p);
  if (own.length) return { stars: own, muon: false, chi: p.chi };
  const x = n.chart.palaces[xung(p.chi)];
  return { stars: chinh(x), muon: true, chi: x.chi };
}
const NHOM: [string, string, 'sat-phu' | 'co-nguyet'][] = [
  ['tu-phu-vu-tuong', 'Tử Phủ Vũ Tướng', 'sat-phu'],
  ['sat-pha-liem-tham', 'Sát Phá Liêm Tham', 'sat-phu'],
  ['co-nguyet-dong-luong', 'Cơ Nguyệt Đồng Lương', 'co-nguyet'],
  ['cu-nhat', 'Cự Nhật', 'co-nguyet'],
];
const nhomCua = (id: string) => NHOM.find(([g]) => G(g).includes(id));

// ───────────────────────────────────────────── Lớp 1: tuổi & bản mệnh
const HINH = [[3, 6, 9], [2, 11, 8], [1, 4]];
function lop1(a: Nguoi, b: Nguoi): LopHH {
  const ta = a.chart.thienBan, tb = b.chart.thienBan;
  const ca = ta.chiNam, cb = tb.chiNam;
  const muc: MucHH[] = [];
  const add = (tieuDe: string, diem: number, noiDung: string) =>
    muc.push({ tieuDe, diem, danhGia: dg(diem), noiDung, nguon: 'thuc-hanh', huong: 'chung', bangChung: [] });
  const tuoi = `${ta.canChi.nam} – ${tb.canChi.nam}`;
  if (ca === cb) add('Đồng chi tuổi', 0.5, `Hai người cùng tuổi ${CHI[ca]}: dễ hiểu nhau, nhưng cũng dễ cùng mắc một khuyết điểm.`);
  else if ((ca - 1) % 4 === (cb - 1) % 4) add('Chi tam hợp', 2, `Tuổi ${CHI[ca]} và ${CHI[cb]} nằm trong cùng một tam hợp: chí hướng gần nhau, dễ cùng làm cùng tiến.`);
  else if (nhiHop(ca) === cb) add('Chi lục hợp', 2, `Tuổi ${CHI[ca]} và ${CHI[cb]} là lục hợp (nhị hợp): tình cảm gắn bó, hỗ trợ nhau trong đời sống riêng.`);
  else if (xung(ca) === cb) add('Chi lục xung', -2, `Tuổi ${CHI[ca]} và ${CHI[cb]} xung nhau: quan điểm hay ngược chiều, dễ va chạm. Nếu lá số hợp thì vẫn thành, chỉ cần nhường nhịn.`);
  else if (mod(9 - ca - 1, 12) + 1 === cb) add('Chi lục hại', -1.5, `Tuổi ${CHI[ca]} và ${CHI[cb]} là lục hại: dễ hiểu lầm, làm tổn thương nhau những chuyện nhỏ.`);
  else add('Chi bình hòa', 0, `Tuổi ${CHI[ca]} và ${CHI[cb]} không hợp không xung.`);
  if (HINH.some((h) => h.includes(ca) && h.includes(cb) && ca !== cb)) add('Chi tương hình', -1, `${CHI[ca]} – ${CHI[cb]} thuộc nhóm tương hình: dễ sinh bất hòa ngầm, nên tránh tranh hơn thua.`);

  const d = Math.abs(ta.canNam - tb.canNam);
  if (d === 5) add('Can ngũ hợp', 1, `Can ${CAN[ta.canNam]} – ${CAN[tb.canNam]} hợp nhau: dễ đồng thuận, nói chuyện hợp.`);
  else if (d === 6) add('Can tương xung', -1, `Can ${CAN[ta.canNam]} – ${CAN[tb.canNam]} xung nhau: cách làm việc khác nhau, dễ bất đồng.`);

  const ha = ta.menh.hanh, hb = tb.menh.hanh;
  const qh = quanHe(ha, hb);
  const T = { hoa: [0.5, 'tương hòa: tính tình gần nhau, bình ổn.'], sinh: [1.5, `${a.ten} sinh ${b.ten}: ${a.ten} hay vun đắp, hy sinh cho ${b.ten}.`],
    duocSinh: [1.5, `${b.ten} sinh ${a.ten}: ${b.ten} là người nâng đỡ, vun vén cho ${a.ten}.`],
    khac: [-1, `${a.ten} khắc ${b.ten}: ${a.ten} dễ lấn át, ${b.ten} phải nhún nhường.`], biKhac: [-1.5, `${b.ten} khắc ${a.ten}: ${b.ten} dễ lấn át; theo quan niệm cũ, vợ khắc chồng là kém hơn chồng khắc vợ.`] }[qh] as [number, string];
  add(`Nạp âm ${ha} – ${hb}`, T[0], `Bản mệnh ${ta.menh.napAm} và ${tb.menh.napAm}: ${T[1]}`);
  const raw = muc.reduce((s, m) => s + m.diem, 0);
  return { key: 'tuoi', ten: 'Tuổi & bản mệnh', moTa: `${tuoi}: xét Can, Chi năm sinh và ngũ hành nạp âm. Đây là lớp phổ thông nhất, các thầy tử vi coi là phụ: tuổi xung mà lá số hợp vẫn thành.`, nguon: 'thuc-hanh', trongSo: 0.1, diem: clamp(50 + raw * 9), muc };
}

// ───────────────────────────────────────────── Lớp 2: Phu Thê ↔ Mệnh
function moTa(id: string, sang: boolean, linh: 'tc' | 'pt') {
  const x = CT[id]?.[linh];
  return x ? x[sang ? 0 : 1] : '';
}
function phuTheDoiMenh(a: Nguoi, b: Nguoi): MucHH[] {
  const out: MucHH[] = [];
  const pt = P(a, 'Phu Thê');
  const menhB = P(b, 'Mệnh');
  const A = chinhTinhCua(a, pt), B = chinhTinhCua(b, menhB);
  const tenA = A.stars.map((s) => s.ten).join(', ') || '—';
  const tenB = B.stars.map((s) => s.ten).join(', ') || '—';
  const ky = A.stars.map((s) => moTa(s.id, sangSao(s.dacTinh), 'pt')).filter(Boolean);
  const tt = B.stars.map((s) => moTa(s.id, sangSao(s.dacTinh), 'tc')).filter(Boolean);
  const idsA = A.stars.map((s) => s.id), idsB = B.stars.map((s) => s.id);
  const chung = idsA.filter((x) => idsB.includes(x));
  const nA = idsA.map(nhomCua).filter(Boolean), nB = idsB.map(nhomCua).filter(Boolean);
  let diem: number, kl: string;
  if (chung.length) {
    diem = 3; kl = `Cùng có ${lietKe(chung.map((id) => CATALOG.byId[id].ten))}: ${b.ten} đúng là "mẫu người" mà cung Phu Thê của ${a.ten} mô tả.`;
  } else if (nA.some((x) => nB.some((y) => y[0] === x[0]))) {
    diem = 2; kl = `Cùng thuộc bộ ${nA.find((x) => nB.some((y) => y[0] === x[0]))[1]}: tính cách của ${b.ten} khớp phần lớn với hình mẫu ${a.ten} cần.`;
  } else if (nA.some((x) => nB.some((y) => y[2] === x[2]))) {
    diem = 1; kl = `Cùng một hệ sao (${nA[0][2] === 'sat-phu' ? 'Tử Phủ – Sát Phá' : 'Cơ Nguyệt – Cự Nhật'}) nhưng khác bộ: hợp ở nhịp sống, khác ở cách thể hiện.`;
  } else if (nA.length && nB.length) {
    diem = -1; kl = `Khác hệ sao (${nA[0][1]} so với ${nB[0][1]}): ${b.ten} khác khá xa với hình mẫu mà ${a.ten} mong đợi; cần thời gian để chấp nhận khác biệt.`;
  } else {
    diem = 0; kl = 'Không đủ dữ kiện chính tinh để so.';
  }
  out.push({
    tieuDe: `Phu Thê của ${a.ten} ↔ Mệnh của ${b.ten}`, diem, danhGia: dg(diem), nguon: 'thuc-hanh', huong: a.ben,
    noiDung: `Phu Thê ${a.ten} có ${tenA}${A.muon ? ' (vô chính diệu, mượn cung xung)' : ''}${ky.length ? ` (${ky.join('; ')})` : ''}. Mệnh ${b.ten} có ${tenB}${B.muon ? ' (mượn cung xung)' : ''}${tt.length ? ` (${tt.join('; ')})` : ''}. ${kl}`,
    bangChung: [bc(a, `Phu Thê ${a.ten}`, [A.chi], idsA), bc(b, `Mệnh ${b.ten}`, [B.chi], idsB)],
  });
  const d100 = thang100(diemCung(a.chart, pt.chi));
  const dq = (d100 - 50) / 18;
  out.push({
    tieuDe: `Nền cung Phu Thê của ${a.ten}`, diem: Math.round(dq * 10) / 10, danhGia: d100 >= 60 ? 'cat' : d100 < 42 ? 'hung' : 'trung', nguon: 'tong-hop', huong: a.ben,
    noiDung: `Bản thân lá số ${a.ten} có cung Phu Thê ở mức ${d100}/100 — ${d100 >= 60 ? 'duyên vợ chồng sẵn tốt, dễ giữ hạnh phúc' : d100 < 42 ? 'duyên vợ chồng vốn nhiều thử thách, dù lấy ai cũng cần vun đắp nhiều' : 'duyên vợ chồng trung bình, tốt xấu tuỳ cách vun đắp'}.`,
    bangChung: [bc(a, `Phu Thê ${a.ten}`, [pt.chi])],
  });
  return out;
}
function lop2(a: Nguoi, b: Nguoi): LopHH {
  const muc = [...phuTheDoiMenh(a, b), ...phuTheDoiMenh(b, a)];
  const raw = muc.reduce((s, m) => s + m.diem, 0);
  return { key: 'phu-the', ten: 'Phu Thê ↔ Mệnh', moTa: 'Cung Phu Thê của người này mô tả "người sẽ lấy". Đối chiếu với chính tinh thủ Mệnh của người kia, xét cả hai chiều. Thêm vào đó là nền cung Phu Thê sẵn có của mỗi lá số.', nguon: 'thuc-hanh', trongSo: 0.25, diem: clamp(50 + (raw - 1.5) * 6), muc };
}

// ───────────────────────────────────────────── Lớp 3: chồng lá số
const ROI: Record<string, [number, string]> = {
  'Mệnh': [2, 'đồng điệu, dễ thấy "cùng tần số", hiểu nhau không cần nói nhiều'],
  'Phu Thê': [3, 'đúng "tuổi duyên" — thường được coi là duyên tiền định'],
  'Phúc Đức': [2, 'đem lại sự an ổn tinh thần, phúc phần chung'],
  'Tài Bạch': [1.5, 'hỗ trợ, cùng gây dựng tài chính'],
  'Quan Lộc': [1, 'trợ lực công việc, sự nghiệp'],
  'Điền Trạch': [1, 'vun vén nhà cửa, tài sản'],
  'Tử Tức': [1, 'thuận về con cái'],
  'Thiên Di': [0.5, 'gặp gỡ, đồng hành khi ra ngoài; quan hệ có phần xã giao'],
  'Phụ Mẫu': [0.5, 'như người bề trên, hay dạy dỗ, che chở'],
  'Huynh Đệ': [0, 'thân như anh em, bạn bè — gần gũi nhưng thiếu lửa'],
  'Nô Bộc': [-1, 'dễ thành quan hệ trên – dưới, một bên luôn phải chiều bên kia'],
  'Tật Ách': [-1, 'dễ thành mối bận tâm, lo lắng cho nhau, đôi khi phiền lụy'],
};
function roiVao(a: Nguoi, b: Nguoi, chi: number, nhan: string, he: number): MucHH {
  const p = a.chart.palaces[chi];
  const [v, y] = ROI[p.ten];
  const xau = coSao(p, [...SAT, 'hoa-ky']);
  const tot = coSao(p, ['hoa-loc', 'hoa-quyen', 'hoa-khoa', 'loc-ton', 'ta-phu', 'huu-bat', 'thien-khoi', 'thien-viet']);
  let d = v * he;
  let them = '';
  if (xau.length >= 2 || xau.some((s) => s.id === 'hoa-ky')) { d -= 1 * he; them = ` Tuy vậy cung này có ${lietKe(xau.map((s) => s.ten))} nên kèm cả phiền lụy.`; }
  else if (tot.length) { d += 0.5 * he; them = ` Cung có ${lietKe(tot.map((s) => s.ten))} nên càng tốt.`; }
  return {
    tieuDe: `${nhan} ${b.ten} → ${p.ten} của ${a.ten}`, diem: Math.round(d * 10) / 10, danhGia: dg(d), nguon: 'thuc-hanh', huong: a.ben,
    noiDung: `${nhan} của ${b.ten} (${CHI[chi]}) rơi vào cung ${p.ten} trên lá số ${a.ten}: ${y}.${them}`,
    bangChung: [bc(a, `${p.ten} ${a.ten}`, [chi], [...xau, ...tot].map((s) => s.id))],
  };
}
function lop3(a: Nguoi, b: Nguoi): LopHH {
  const muc: MucHH[] = [];
  for (const [x, y] of [[a, b], [b, a]] as [Nguoi, Nguoi][]) {
    muc.push(roiVao(x, y, y.chart.thienBan.chiNam, 'Tuổi', 1));
    muc.push(roiVao(x, y, y.chart.thienBan.cungMenh, 'Cung Mệnh', 0.6));
  }
  const ma = a.chart.thienBan.cungMenh, mb = b.chart.thienBan.cungMenh;
  let d = 0, t = '';
  if (ma === mb) { d = 1; t = 'cùng một địa chi: nhìn đời giống nhau.'; }
  else if (tamHop(ma).includes(mb)) { d = 1.5; t = 'tam hợp: cùng chí hướng, chung mục tiêu.'; }
  else if (nhiHop(ma) === mb) { d = 1.5; t = 'nhị hợp: gắn bó tình cảm, hợp đời sống riêng tư.'; }
  else if (xung(ma) === mb) { d = -0.5; t = 'xung chiếu: hai góc nhìn đối diện, bù trừ cho nhau nhưng dễ ngược quan điểm.'; }
  else t = 'không hợp không xung.';
  muc.push({ tieuDe: 'Vị trí hai cung Mệnh', diem: d, danhGia: dg(d), nguon: 'thuc-hanh', huong: 'chung',
    noiDung: `Mệnh ${a.ten} ở ${CHI[ma]}, Mệnh ${b.ten} ở ${CHI[mb]} — ${t}`, bangChung: [bc(a, `Mệnh ${a.ten}`, [ma]), bc(b, `Mệnh ${b.ten}`, [mb])] });
  const raw = muc.reduce((s, m) => s + m.diem, 0);
  return { key: 'chong-la-so', ten: 'Chồng lá số', moTa: 'Đặt hai lá số lên cùng một địa bàn. Chi năm sinh và cung Mệnh của người kia rơi vào cung nào trên lá số mình, thì người đó đóng vai trò ấy trong đời mình.', nguon: 'thuc-hanh', trongSo: 0.15, diem: clamp(50 + (raw - 4) * 5), muc };
}

// ───────────────────────────────────────────── Lớp 4: Tứ Hóa giao thoa
const LINH_VUC: Record<string, string> = {
  'Mệnh': 'bản thân', 'Phu Thê': 'đời sống tình cảm, vợ chồng', 'Phúc Đức': 'tinh thần, phúc phần', 'Tài Bạch': 'tiền bạc',
  'Quan Lộc': 'công việc, sự nghiệp', 'Điền Trạch': 'nhà cửa, tài sản', 'Tử Tức': 'chuyện con cái', 'Tật Ách': 'sức khỏe',
  'Thiên Di': 'việc ra ngoài, giao tế', 'Phụ Mẫu': 'quan hệ với cha mẹ', 'Huynh Đệ': 'anh em, bạn bè', 'Nô Bộc': 'bạn bè, người dưới',
};
// [Lộc, Quyền, Khoa, Kỵ]
const W_HOA: Record<string, number[]> = {
  'Mệnh': [2, 1, 1, -2], 'Phu Thê': [3, 1, 1.5, -3], 'Phúc Đức': [2, 1, 1, -2], 'Tài Bạch': [1.5, 1, 0.5, -1.5],
  'Quan Lộc': [1, 1, 0.5, -1.5], 'Điền Trạch': [1, 0.5, 0.5, -1], 'Tử Tức': [1, 0.5, 0.5, -1], 'Tật Ách': [0.5, 0, 0.5, -2],
  'Thiên Di': [0.5, 0.5, 0.5, -1.5], 'Phụ Mẫu': [0.5, 0, 0.5, -0.5], 'Huynh Đệ': [0.5, 0, 0.5, -0.5], 'Nô Bộc': [0, 0, 0, -0.5],
};
const HOA_TEN = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'];
const KY_RIENG: Record<string, string> = {
  'Mệnh': 'người kia cảm thấy "nợ", hay bị làm phiền lòng mà khó dứt ra — gắn bó sâu nhưng nặng nề',
  'Phu Thê': 'tình cảm nhiều vướng mắc, dễ ghen tuông, kiểm soát nhau',
  'Thiên Di': 'Kỵ xung chiếu Mệnh: hay va chạm quan điểm, ra ngoài dễ bất đồng',
  'Quan Lộc': 'Kỵ xung chiếu Phu Thê: chuyện công việc hay chen vào đời sống vợ chồng',
  'Tài Bạch': 'dễ hao tài vì nhau hoặc bất đồng chuyện tiền bạc',
  'Tật Ách': 'dễ sinh căng thẳng, ảnh hưởng sức khỏe tinh thần',
  'Phúc Đức': 'hay lo nghĩ, bận lòng vì người kia',
};
function lop4(a: Nguoi, b: Nguoi): LopHH {
  const muc: MucHH[] = [];
  for (const [x, y] of [[a, b], [b, a]] as [Nguoi, Nguoi][]) {
    const can = y.chart.thienBan.canNam;
    TU_HOA[can].forEach((id, i) => {
      const p = x.chart.palaces.find((q) => q && q.stars.some((s) => s.id === id));
      if (!p) return;
      const w = W_HOA[p.ten][i];
      const lv = LINH_VUC[p.ten];
      const sao = CATALOG.byId[id].ten;
      const y1 = [
        `${y.ten} làm ${lv} của ${x.ten} thêm hanh thông, vui vẻ — ${x.ten} thấy "được nhờ" ở mặt này`,
        `${y.ten} có tiếng nói lớn, hay định hướng (đôi khi áp đặt) ${lv} của ${x.ten}`,
        `${y.ten} giúp ${lv} của ${x.ten} êm thấm, có thể diện; là người hòa giải`,
        `${y.ten} khiến ${lv} của ${x.ten} vướng bận — ${KY_RIENG[p.ten] || 'gắn bó nhưng dễ sinh phiền muộn ở mặt này'}`,
      ][i];
      muc.push({
        tieuDe: `${HOA_TEN[i]} của ${y.ten} → ${p.ten} của ${x.ten}`, diem: w, danhGia: dg(w), nguon: 'thuc-hanh', huong: x.ben,
        noiDung: `Can năm ${CAN[can]} của ${y.ten} hóa ${HOA_TEN[i].slice(4)} ở sao ${sao}, mà sao ${sao} trên lá số ${x.ten} đóng tại cung ${p.ten}: ${y1}.`,
        bangChung: [bc(x, `${sao} (${p.ten} ${x.ten})`, [p.chi], [id])],
      });
    });
    const loc = LOC_TON[can];
    const pl = x.chart.palaces[loc];
    if (['Mệnh', 'Phu Thê', 'Tài Bạch', 'Phúc Đức', 'Điền Trạch'].includes(pl.ten)) {
      muc.push({ tieuDe: `Lộc Tồn của ${y.ten} → ${pl.ten} của ${x.ten}`, diem: 1, danhGia: 'cat', nguon: 'thuc-hanh', huong: x.ben,
        noiDung: `Lộc Tồn theo can ${CAN[can]} của ${y.ten} an tại ${CHI[loc]}, là cung ${pl.ten} của ${x.ten}: ${y.ten} giúp ${LINH_VUC[pl.ten]} của ${x.ten} bền vững, tích tụ.`,
        bangChung: [bc(x, `${pl.ten} ${x.ten}`, [loc])] });
    }
    for (const [chi, ten] of [[dich(loc, 1), 'Kình Dương'], [dich(loc, -1), 'Đà La']] as [number, string][]) {
      const pk = x.chart.palaces[chi];
      if (pk.ten === 'Mệnh' || pk.ten === 'Phu Thê')
        muc.push({ tieuDe: `${ten} của ${y.ten} → ${pk.ten} của ${x.ten}`, diem: -1, danhGia: 'hung', nguon: 'thuc-hanh', huong: x.ben,
          noiDung: `${ten} theo can ${CAN[can]} của ${y.ten} rơi vào cung ${pk.ten} của ${x.ten}: ${ten === 'Kình Dương' ? 'lời nói, hành động dễ làm tổn thương nhau, va chạm thẳng' : 'hay dây dưa, ấm ức, chuyện nhỏ kéo dài'}.`,
          bangChung: [bc(x, `${pk.ten} ${x.ten}`, [chi])] });
    }
  }
  const raw = muc.reduce((s, m) => s + m.diem, 0);
  return { key: 'tu-hoa', ten: 'Tứ Hóa giao thoa', moTa: 'Phép "Thái Tuế nhập quái": lấy Tứ Hóa (Lộc, Quyền, Khoa, Kỵ) và Lộc Tồn, Kình, Đà theo can năm sinh của người kia, đặt lên lá số của mình. Cách này cho thấy ai nâng ai, ai đè ai, ở mặt nào của đời sống.', nguon: 'thuc-hanh', trongSo: 0.3, diem: clamp(50 + (raw - 1.5) * 4), muc };
}

// ───────────────────────────────────────────── Lớp 5: bổ sung
const DONG = G('sat-pha-liem-tham');
const TINH = G('co-nguyet-dong-luong');
function tinhKhi(n: Nguoi) {
  const ids = chinhTinhCua(n, P(n, 'Mệnh')).stars.map((s) => s.id);
  return { ids, dong: ids.some((x) => DONG.includes(x)), tinh: ids.some((x) => TINH.includes(x)) && !ids.some((x) => DONG.includes(x)), ten: ids.map((x) => CATALOG.byId[x].ten).join(', ') || 'vô chính diệu' };
}
function lop5(a: Nguoi, b: Nguoi): { lop: LopHH; phuongDien: PhuongDienHH[]; duongDoi: HopHonView['duongDoi'] } {
  const muc: MucHH[] = [];
  const pd: PhuongDienHH[] = [];
  const ca = a.lg.tongKet.chuDe, cb = b.lg.tongKet.chuDe;
  const QUAN_TRONG = ['tinh-duyen', 'con-cai', 'tai-loc', 'phuc-duc'];
  for (const x of ca) {
    const y = cb.find((c) => c.key === x.key);
    const [hi, lo] = x.diem >= y.diem ? [a, b] : [b, a];
    let d = 0, kl = 'Ngang nhau, không có gì nổi bật.';
    if (x.diem >= 62 && y.diem >= 62) { d = 0.5; kl = 'Cả hai cùng mạnh: thế mạnh chung của gia đình.'; }
    else if (x.diem < 42 && y.diem < 42) { d = QUAN_TRONG.includes(x.key) ? -2 : -1; kl = 'Cả hai cùng yếu: rủi ro cộng dồn, không ai gánh được cho ai.'; }
    else if (Math.max(x.diem, y.diem) >= 62 && Math.min(x.diem, y.diem) < 45) { d = 0.75; kl = `Bổ sung: ${hi.ten} mạnh, gánh được phần yếu của ${lo.ten}.`; }
    else if (Math.abs(x.diem - y.diem) >= 15) kl = `${hi.ten} nhỉnh hơn; nên để ${hi.ten} lo chính mặt này.`;
    pd.push({ key: x.key, tieuDe: x.tieuDe, nam: a.ben === 'nam' ? x.diem : y.diem, nu: a.ben === 'nam' ? y.diem : x.diem, ketLuan: kl, danhGia: dg(d) });
    if (d) muc.push({ tieuDe: x.tieuDe, diem: d, danhGia: dg(d), nguon: 'tong-hop', huong: 'chung', noiDung: `${a.ten} ${x.diem}/100, ${b.ten} ${y.diem}/100. ${kl}`,
      bangChung: [bc(a, `${x.tieuDe} ${a.ten}`, x.cung.map((c) => c.chi)), bc(b, `${y.tieuDe} ${b.ten}`, y.cung.map((c) => c.chi))] });
  }
  // tính khí
  const ka = tinhKhi(a), kb = tinhKhi(b);
  const both = [...ka.ids, ...kb.ids];
  const ev = [bc(a, `Mệnh ${a.ten}`, [chinhTinhCua(a, P(a, 'Mệnh')).chi], ka.ids), bc(b, `Mệnh ${b.ten}`, [chinhTinhCua(b, P(b, 'Mệnh')).chi], kb.ids)];
  const tk = (d: number, t: string) => muc.push({ tieuDe: 'Tính khí hai người', diem: d, danhGia: dg(d), nguon: 'thuc-hanh', huong: 'chung', noiDung: `Mệnh ${a.ten}: ${ka.ten}; Mệnh ${b.ten}: ${kb.ten}. ${t}`, bangChung: ev });
  if ((ka.dong && kb.tinh) || (kb.dong && ka.tinh)) tk(1.5, 'Một người động (Sát Phá Liêm Tham), một người tĩnh (Cơ Nguyệt Đồng Lương): người xông pha, người giữ nhà, bù cho nhau.');
  else if (ka.dong && kb.dong) tk(-1.5, 'Cả hai đều thuộc bộ Sát Phá Liêm Tham: cá tính mạnh, quyết đoán, dễ "hai hổ một núi". Cần phân rõ việc ai người nấy quyết.');
  else if (ka.tinh && kb.tinh) tk(0.5, 'Cả hai đều thuộc bộ Cơ Nguyệt Đồng Lương: hiền hòa, ít va chạm, nhưng gặp việc lớn dễ thiếu người quyết đoán.');
  const QUYEN = ['tu-vi', 'that-sat', 'pha-quan'];
  if (both.includes('tu-vi') && ka.ids.some((x) => QUYEN.includes(x)) && kb.ids.some((x) => QUYEN.includes(x)))
    tk(-1, 'Đế tinh Tử Vi gặp một sao cũng muốn làm chủ (Tử Vi, Thất Sát, Phá Quân): dễ tranh quyền quyết định trong nhà.');
  if (ka.ids.includes('cu-mon') && kb.ids.includes('cu-mon')) tk(-1, 'Cả hai Mệnh đều có Cự Môn: hay tranh luận, khẩu thiệt; nói ít đi một câu là êm.');

  // đường đời theo năm dương lịch
  const serie = (n: Nguoi) => n.lg.tongKet.duongDoi.diem.flatMap((d) => Array.from({ length: d.denNam - d.tuNam + 1 }, (_, i) => ({ nam: d.tuNam + i, diem: d.diem })));
  const sa = serie(a), sb = serie(b);
  const tu = Math.max(a.chart.thienBan.amLich.nam, b.chart.thienBan.amLich.nam) + 20;
  const den = Math.min(a.chart.thienBan.amLich.nam, b.chart.thienBan.amLich.nam) + 75;
  const giaiDoan: HopHonView['duongDoi']['giaiDoan'] = [];
  let cur: (typeof giaiDoan)[0] = null;
  for (let y = tu; y <= den; y++) {
    const da = sa.find((s) => s.nam === y)?.diem, db = sb.find((s) => s.nam === y)?.diem;
    const loai = da == null || db == null ? null : da < 45 && db < 45 ? 'cung-tram' : da >= 62 && db >= 62 ? 'cung-thinh' : null;
    if (loai && cur && cur.loai === loai && cur.denNam === y - 1) cur.denNam = y;
    else if (loai) { cur = { tuNam: y, denNam: y, loai, noiDung: '' }; giaiDoan.push(cur); } else cur = null;
  }
  for (const g of giaiDoan) {
    g.noiDung = g.loai === 'cung-tram' ? `${g.tuNam}–${g.denNam}: cả hai cùng đi vào vận khó — giai đoạn dễ vỡ nhất, nên giữ ổn định, tránh quyết định lớn.` : `${g.tuNam}–${g.denNam}: cả hai cùng vào vận đẹp — thời điểm dồn sức cho việc lớn của gia đình.`;
    muc.push({ tieuDe: g.loai === 'cung-tram' ? 'Cùng trũng vận' : 'Cùng thịnh vận', diem: g.loai === 'cung-tram' ? -1 : 1, danhGia: g.loai === 'cung-tram' ? 'hung' : 'cat', nguon: 'tong-hop', huong: 'chung', noiDung: g.noiDung, bangChung: [] });
  }
  const raw = muc.reduce((s, m) => s + m.diem, 0);
  return {
    lop: { key: 'bo-sung', ten: 'Bổ sung & đồng hành', moTa: 'So 9 phương diện của hai lá số để xem mặt nào bù cho nhau, mặt nào cùng yếu. Xét thêm tính khí qua chính tinh thủ Mệnh, và chồng hai đường đời theo năm dương lịch.', nguon: 'tong-hop', trongSo: 0.2, diem: clamp(50 + (raw - 3) * 5), muc },
    phuongDien: pd,
    duongDoi: { nam: (a.ben === 'nam' ? sa : sb).filter((s) => s.nam >= tu - 5 && s.nam <= den), nu: (a.ben === 'nam' ? sb : sa).filter((s) => s.nam >= tu - 5 && s.nam <= den), giaiDoan },
  };
}

// ───────────────────────────────────────────── Vấn đề nếu thành
function vanDeCua(n: Nguoi): VanDe[] {
  const out: VanDe[] = [];
  const p = P(n, 'Phu Thê');
  const tp = tamPhuong(p.chi);
  const inTp = (ids: string[]) => tp.flatMap((c) => n.chart.palaces[c].stars.filter((s) => ids.includes(s.id)).map((s) => ({ chi: c, id: s.id })));
  const toa = (ids: string[]) => coSao(p, ids);
  const add = (nhom: string, tieuDe: string, noiDung: string, danhGia: DanhGia, nguon: Nguon, hits: Hit[], trang?: number | string) =>
    out.push({ nhom, tieuDe, noiDung: `${n.ten}: ${noiDung}`, danhGia, nguon, trang, ben: n.ben, bangChung: [{ ten: tieuDe, ben: n.ben, hits, cung: [p.chi] }] });

  if (p.tuan || p.triet) add('Trắc trở, muộn màng', `${p.tuan ? 'Tuần' : ''}${p.tuan && p.triet ? ', ' : ''}${p.triet ? 'Triệt' : ''} ở Phu Thê`, 'Phu Thê bị án ngữ: chuyện cưới xin dễ trắc trở lúc đầu, lập gia đình muộn thì bền hơn (Tuần Triệt trấn áp cả tốt lẫn xấu).', 'hung', 'thuc-hanh', []);
  const co = toa(['co-than', 'qua-tu']);
  if (co.length) add('Trắc trở, muộn màng', 'Cô Thần / Quả Tú ở Phu Thê', 'Sách nói: đóng ở cung Phối thì làm trắc trở sự cưới hỏi và cuộc sống ái ân vợ chồng; dễ lạnh nhạt, ít chia sẻ.', 'hung', 'sach', co.map((s) => ({ chi: p.chi, id: s.id })), 85);
  const sat = toa(['kinh-duong', 'da-la', 'hoa-tinh', 'linh-tinh', 'thien-hinh']);
  if (sat.length) add('Xung khắc, cãi vã', `${lietKe(sat.map((s) => s.ten))} ở Phu Thê`, 'Vợ chồng tính nóng, dễ xung khắc, cãi vã; sát tinh hãm địa thì nặng hơn.', 'hung', 'thuc-hanh', sat.map((s) => ({ chi: p.chi, id: s.id })));
  if (toa(['cu-mon']).length) add('Xung khắc, cãi vã', 'Cự Môn ở Phu Thê', 'Hay khẩu thiệt, tranh cãi bằng lời; hiểu lầm vì cách nói.', 'hung', 'thuc-hanh', [{ chi: p.chi, id: 'cu-mon' }]);
  const kk = inTp(['dia-khong', 'dia-kiep']), hd = inTp(['hong-loan', 'dao-hoa']);
  if (kk.length && hd.length) add('Dang dở, đổ vỡ', 'Không Kiếp hội Hồng Đào', 'Không, Kiếp hội với Hồng, Đào thì duyên nợ dang dở, có thể phải trải qua đôi độ cưới xin.', 'hung', 'sach', [...kk, ...hd], 83);
  const th = inTp(['ta-phu', 'huu-bat']);
  if (th.length && hd.length) add('Người thứ ba', 'Tả Hữu hội Hồng Đào ở Phu Thê', 'Cung Thê có Tả Hữu, Hồng Đào chiếu: nếu đến hạn lại gặp dâm tinh thì dễ vướng thêm nợ tình. Đây là năm cần giữ mình.', 'hung', 'sach', [...th, ...hd], 138);
  if (toa(['that-sat']).length) add('Kén chọn, khó hài lòng', 'Thất Sát ở Phu Thê', 'Sách nói cung Thê có Thất Sát đóng thì "đến 5 thiếp cũng chẳng vừa": khó hài lòng với người phối ngẫu, đòi hỏi cao.', 'hung', 'sach', [{ chi: p.chi, id: 'that-sat' }], 138);
  if (toa(['thien-ma']).length) add('Xa cách', 'Thiên Mã ở Phu Thê', 'Vợ chồng hay xa nhau vì công việc, đi lại; hoặc lấy người ở xa.', 'trung', 'thuc-hanh', [{ chi: p.chi, id: 'thien-ma' }]);
  if (toa(['hoa-ky']).length) add('Ghen tuông, vướng mắc', 'Hóa Kỵ ở Phu Thê', 'Tình cảm sâu nhưng hay ghen, kiểm soát, giận dỗi; nên giữ không gian riêng cho nhau.', 'hung', 'thuc-hanh', [{ chi: p.chi, id: 'hoa-ky' }]);
  if (toa(['thai-am']).length && n.ben === 'nam') add('Vai trò trong nhà', 'Thái Âm ở Phu Thê (nam)', 'Vợ đảm, chồng nhờ vợ, nể vợ.', 'trung', 'sach', [{ chi: p.chi, id: 'thai-am' }], 95);
  // luật trong sách khớp tại Phu Thê
  const cv = n.lg.cung.find((c) => c.ten === 'Phu Thê');
  for (const m of (cv?.luat || []).filter((x) => x.danhGia !== 'trung').sort((x, y) => y.mucDo - x.mucDo).slice(0, 6)) {
    if (out.some((o) => o.tieuDe === m.ten)) continue;
    out.push({ nhom: m.danhGia === 'cat' ? 'Điểm tựa' : 'Theo sách', tieuDe: m.ten, noiDung: `${n.ten}: ${m.ketLuan}`, danhGia: m.danhGia, nguon: 'sach', trang: m.trang, ben: n.ben, bangChung: [{ ten: m.ten, ben: n.ben, hits: m.hits, cung: [m.chi] }] });
  }
  return out;
}
function vanDe(a: Nguoi, b: Nguoi, pd: PhuongDienHH[]): VanDe[] {
  const va = vanDeCua(a), vb = vanDeCua(b);
  const out = [...va, ...vb];
  const nhomA = new Set(va.filter((x) => x.danhGia === 'hung').map((x) => x.nhom)), nhomB = new Set(vb.filter((x) => x.danhGia === 'hung').map((x) => x.nhom));
  for (const nh of nhomA) if (nhomB.has(nh) && nh !== 'Theo sách')
    out.unshift({ nhom: nh, tieuDe: `Cả hai cùng có dấu hiệu "${nh.toLowerCase()}"`, noiDung: `Dấu hiệu xuất hiện ở cung Phu Thê của cả hai người nên dễ ứng hơn. Đây là việc cần thống nhất cách xử lý trước khi cưới.`, danhGia: 'hung', nguon: 'tong-hop', ben: 'chung', bangChung: [] });
  for (const x of pd.filter((p) => p.danhGia === 'hung'))
    out.push({ nhom: x.key === 'con-cai' ? 'Con cái' : x.key === 'tai-loc' ? 'Tài chính' : 'Cùng yếu', tieuDe: `Cùng yếu: ${x.tieuDe.toLowerCase()}`, noiDung: x.ketLuan, danhGia: 'hung', nguon: 'tong-hop', ben: 'chung', bangChung: [] });
  return out;
}

// ───────────────────────────────────────────── Năm nên cưới (tr.138)
const COMBO: [string, (has: (id: string) => boolean) => boolean][] = [
  ['Sát Phá Liêm gặp Đào', (h) => ['that-sat', 'pha-quan', 'liem-trinh'].some(h) && h('dao-hoa')],
  ['Vũ, Diêu, Lộc, Mã, Hỉ, Đào/Hồng', (h) => [h('vu-khuc'), h('thien-rieu'), h('loc-ton') || h('hoa-loc'), h('thien-ma'), h('thien-hy'), h('dao-hoa') || h('hong-loan')].filter(Boolean).length >= 5],
  ['Tả Hữu, Hồng/Đào, Thiên Hỉ', (h) => (h('ta-phu') || h('huu-bat')) && (h('hong-loan') || h('dao-hoa')) && h('thien-hy')],
  ['Long Phượng, Hỉ Thần', (h) => h('long-tri') && h('phuong-cac') && h('hy-than')],
  ['Đào Hồng, Nhật Nguyệt (hay Diêu Hỉ)', (h) => h('dao-hoa') && h('hong-loan') && ((h('thai-duong') && h('thai-am')) || (h('thien-rieu') && h('thien-hy')))],
];
function dauHieuCuoi(n: Nguoi, y: number) {
  const luu = tinhLuuNien(n.chart, y);
  const out: string[] = [];
  const hits: Hit[] = [];
  // Chỉ xét tam phương cung tiểu hạn: đại hạn kéo dài 10 năm nên không phân biệt được từng năm.
  const tp = tamPhuong(luu.tieuHan.chi);
  const has = (id: string) => tp.some((c) => n.chart.palaces[c].stars.some((s) => s.id === id));
  for (const [ten, f] of COMBO) if (f(has)) out.push(ten);
  const pt = n.chart.palaces[luu.tieuHan.chi];
  const ht = coSao(pt, ['hong-loan', 'thien-hy']);
  if (ht.length) { out.push(`Tiểu hạn gặp ${lietKe(ht.map((s) => s.ten))}`); hits.push(...ht.map((s) => ({ chi: pt.chi, id: s.id }))); }
  if (luu.tieuHan.ten === 'Phu Thê') out.push('Tiểu hạn vào cung Phu Thê');
  return { out, luu, hits };
}
function namCuoi(a: Nguoi, b: Nguoi, namXem: number): NamCuoi[] {
  const [nam, nu] = a.ben === 'nam' ? [a, b] : [b, a];
  const res: NamCuoi[] = [];
  for (let y = namXem; y <= namXem + 10; y++) {
    const tuoiNam = y - nam.chart.thienBan.amLich.nam + 1, tuoiNu = y - nu.chart.thienBan.amLich.nam + 1;
    if (tuoiNam < 16 || tuoiNu < 16) continue;
    const A = dauHieuCuoi(nam, y), B = dauHieuCuoi(nu, y);
    const canhBao: string[] = [];
    const chiY = mod(y + 8, 12) + 1, canY = mod(y + 6, 10) + 1;
    if ([1, 3, 6, 8].includes(tuoiNu % 9)) canhBao.push(`Nữ ${tuoiNu} tuổi phạm Kim Lâu (theo tục lệ)`);
    if (xung(chiY) === nam.chart.thienBan.chiNam) canhBao.push(`Năm ${CHI[chiY]} xung tuổi ${nam.ten}`);
    if (xung(chiY) === nu.chart.thienBan.chiNam) canhBao.push(`Năm ${CHI[chiY]} xung tuổi ${nu.ten}`);
    const sa = A.out.length, sb = B.out.length;
    // Dấu hiệu theo sách quyết định bậc; cấm kỵ theo tục lệ hạ một bậc.
    const BAC = ['tranh', 'thuong', 'kha', 'dep'] as const;
    const bac = (sa && sb ? 3 : sa || sb ? 2 : 1) - (canhBao.length ? 1 : 0);
    const xepHang = BAC[Math.max(0, bac)];
    res.push({
      nam: y, canChi: `${CAN[canY]} ${CHI[chiY]}`, tuoiNam, tuoiNu, dauHieuNam: A.out, dauHieuNu: B.out, canhBao,
      danhGia: xepHang === 'dep' ? 'cat' : xepHang === 'tranh' ? 'hung' : 'trung', xepHang,
      bangChung: [
        { ten: `Tiểu hạn ${nam.ten} ${y}`, ben: nam.ben, hits: A.hits, cung: [A.luu.tieuHan.chi] },
        { ten: `Tiểu hạn ${nu.ten} ${y}`, ben: nu.ben, hits: B.hits, cung: [B.luu.tieuHan.chi] },
      ],
    });
  }
  return res;
}

// ───────────────────────────────────────────── Dấu chồng lá số (để vẽ lên lá số của x)
function chong(x: Nguoi, y: Nguoi): DauChong[] {
  const out: DauChong[] = [];
  const tyb = y.chart.thienBan;
  const r = (chi: number) => ROI[x.chart.palaces[chi].ten][0];
  out.push({ chi: tyb.chiNam, nhan: 'Tuổi', loai: dg(r(tyb.chiNam)), tip: `Tuổi ${y.ten} (${CHI[tyb.chiNam]}) rơi vào cung này` });
  out.push({ chi: tyb.cungMenh, nhan: 'Mệnh', loai: dg(r(tyb.cungMenh)), tip: `Cung Mệnh của ${y.ten} (${CHI[tyb.cungMenh]}) trùng địa chi cung này` });
  TU_HOA[tyb.canNam].forEach((id, i) => {
    const p = x.chart.palaces.find((q) => q && q.stars.some((s) => s.id === id));
    if (p) out.push({ chi: p.chi, id, nhan: ['Lộc', 'Quyền', 'Khoa', 'Kỵ'][i], loai: i === 3 ? 'hung' : 'cat', tip: `${HOA_TEN[i]} theo can ${CAN[tyb.canNam]} của ${y.ten} ở sao ${CATALOG.byId[id].ten}` });
  });
  const loc = LOC_TON[tyb.canNam];
  out.push({ chi: loc, nhan: 'Lộc Tồn', loai: 'cat', tip: `Lộc Tồn theo can ${CAN[tyb.canNam]} của ${y.ten}` });
  out.push({ chi: dich(loc, 1), nhan: 'Kình', loai: 'hung', tip: `Kình Dương theo can ${CAN[tyb.canNam]} của ${y.ten}` });
  out.push({ chi: dich(loc, -1), nhan: 'Đà', loai: 'hung', tip: `Đà La theo can ${CAN[tyb.canNam]} của ${y.ten}` });
  return out;
}

// ───────────────────────────────────────────── Tổng hợp
export function xemHopHonTuLaSo(nam: { chart: Chart; lg: LuanGiai }, nu: { chart: Chart; lg: LuanGiai }, namXem: number): HopHonView {
  const ten = (c: Chart, d: string) => (c.input.ten && c.input.ten.trim() && c.input.ten !== 'Đương số' ? c.input.ten.trim() : d);
  const a: Nguoi = { ben: 'nam', ten: ten(nam.chart, 'Nam'), ...nam };
  const b: Nguoi = { ben: 'nu', ten: ten(nu.chart, 'Nữ'), ...nu };
  if (a.ten === b.ten) { a.ten += ' (nam)'; b.ten += ' (nữ)'; }
  const l5 = lop5(a, b);
  const lop = [lop1(a, b), lop2(a, b), lop3(a, b), lop4(a, b), l5.lop];
  const diem = Math.round(lop.reduce((s, l) => s + l.diem * l.trongSo, 0) / lop.reduce((s, l) => s + l.trongSo, 0));
  const xepLoai = diem >= 70 ? 'Rất hợp' : diem >= 60 ? 'Hợp' : diem >= 50 ? 'Khá hợp' : diem >= 42 ? 'Nhiều thử thách' : 'Khắc nhiều';
  const tieuDe = { 'Rất hợp': 'Duyên lành, nâng đỡ nhau', 'Hợp': 'Hợp nhau, bổ sung cho nhau', 'Khá hợp': 'Khá hợp — vun đắp thì bền', 'Nhiều thử thách': 'Nhiều khác biệt, cần nhường nhịn', 'Khắc nhiều': 'Khắc nhiều hơn hợp, cần cân nhắc kỹ' }[xepLoai];
  const tatCa = lop.flatMap((l) => l.muc);
  const tot = [...tatCa].filter((m) => m.diem > 0).sort((x, y) => y.diem - x.diem).slice(0, 3);
  const xau = [...tatCa].filter((m) => m.diem < 0).sort((x, y) => x.diem - y.diem).slice(0, 3);
  const vd = vanDe(a, b, l5.phuongDien);
  const nc = namCuoi(a, b, namXem);
  const manh = [...lop].sort((x, y) => y.diem - x.diem)[0], yeu = [...lop].sort((x, y) => x.diem - y.diem)[0];
  const tomTat = [
    `${a.ten} (${a.chart.thienBan.canChi.nam}, ${a.chart.thienBan.menh.napAm}) và ${b.ten} (${b.chart.thienBan.canChi.nam}, ${b.chart.thienBan.menh.napAm}): tổng điểm ${diem}/100, mức "${xepLoai}". Hợp nhất ở lớp ${manh.ten.toLowerCase()} (${manh.diem}), kém nhất ở lớp ${yeu.ten.toLowerCase()} (${yeu.diem}).`,
    tot.length ? `Điểm gắn kết: ${tot.map((m) => m.tieuDe.toLowerCase()).join('; ')}.` : '',
    xau.length ? `Điểm cần lưu tâm: ${xau.map((m) => m.tieuDe.toLowerCase()).join('; ')}.` : '',
    nc.filter((n) => n.xepHang === 'dep').length ? `Năm đẹp để cưới trong 10 năm tới: ${nc.filter((n) => n.xepHang === 'dep').map((n) => n.nam).join(', ')}.` : '',
  ].filter(Boolean);
  return { diem, xepLoai, tieuDe, tomTat, lop, phuongDien: l5.phuongDien, duongDoi: l5.duongDoi, vanDe: vd, namCuoi: nc, ten: { nam: a.ten, nu: b.ten }, chong: { nam: chong(a, b), nu: chong(b, a) } };
}
export const _test = { lop1, nhomCua };
