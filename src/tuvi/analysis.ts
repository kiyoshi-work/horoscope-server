/**
 * Quy trình luận giải lá số như một thầy Tử Vi:
 *  Bước 1 – Quan sát tổng quát: Can Chi năm sinh, Mệnh – Cục, âm dương, mùa/giờ sinh, soát giờ sinh,
 *           sinh–vượng–bại–tuyệt địa, thế đứng chính tinh, thế đứng các cung, bố cục trung tinh/phụ tinh,
 *           vòng Tràng Sinh, Khốc Hư, Tang Hổ, Tuần Triệt.
 *  Bước 2 – Phân tích từng cung theo thứ tự cường cung (nam: Mệnh, Thân, Phúc, Quan, Tài, Di, Thê;
 *           nữ: Mệnh, Thân, Phúc, Phu, Tài, Tử), xét vị trí – tam hợp – xung chiếu – nhị hợp – giáp,
 *           sao tọa thủ & chiếu hợp, miếu hãm, ngũ hành sao/cung/mệnh, Tuần Triệt, bộ sao & phú đoán.
 *  Bước 3 – Vận hạn: đại hạn 10 năm, tiểu hạn & lưu niên năm xem, lưu nguyệt.
 *  Tổng kết theo chủ đề: gia đình → tính cách → số mệnh → tình duyên → sự nghiệp → tài lộc → sức khỏe.
 * Nguồn: Tử Vi Chính Biện (số trang ghi trong từng mục).
 */
import { Chart, Palace, StarInChart } from './chart';
import { CHI, Hanh, QuanHe, TEN_CUNG, dich, giap, muaSinh, nhiHop, quanHe, tamHop, xung, HANH_CAN, HANH_CHI } from './core';
import { CATALOG, KB, StarInfo } from './kb';
import { LuuNien, tinhLuuNien } from './han';
import { Hit, RuleMatch, apLuatGoc, apLuatHan } from './rules';
import { tongKetLuan } from './tongket';

export type DanhGia = 'cat' | 'hung' | 'trung';
export interface Muc {
  key: string;
  tieuDe: string;
  giaTri?: string;
  danhGia?: DanhGia;
  noiDung: string;
  trang?: number | string;
  /** Để giao diện tô sáng */
  hits?: Hit[];
  cung?: number[];
}

export interface MatchView {
  id: string;
  ten: string;
  loai: string;
  ketLuan: string;
  nguyenVan?: string;
  danhGia: DanhGia;
  mucDo: number;
  chuDe: string[];
  trang?: number;
  chi: number;
  cungTen: string;
  hits: Hit[];
  boi: string;
}

export interface SaoView {
  id: string;
  ten: string;
  dacTinh: string | null;
  nhom: string;
  loai: string;
  y: string; // ý nghĩa ngắn gọn trong hoàn cảnh này
}

export interface CungView {
  chi: number;
  ten: string;
  chiTen: string;
  diem: number;
  xepLoai: string;
  viTri: Muc[];
  chinhTinh: SaoView[];
  phuTinh: SaoView[];
  muonSao?: string;
  nguHanh: Muc[];
  tuanTriet?: Muc;
  luat: MatchView[];
  tomTat: string;
}

const TEN_DAC: Record<string, string> = { M: 'miếu', V: 'vượng', Đ: 'đắc địa', B: 'bình hòa', H: 'hãm địa' };
const QH_TEXT: Record<QuanHe, string> = { hoa: 'tương hòa', sinh: 'sinh', duocSinh: 'được sinh bởi', khac: 'khắc', biKhac: 'bị khắc bởi' };

// ───────────────────────────────────────────── Điểm cung (heuristic, minh bạch)
const DIEM_CHINH: Record<string, number> = { M: 3, V: 2.5, Đ: 2, B: 0.5, H: -2 };
function diemSao(s: StarInChart): number {
  const def = CATALOG.byId[s.base || s.id];
  if (!def) return 0;
  if (def.loai === 'chinh') return DIEM_CHINH[s.dacTinh] ?? 1;
  if (def.tags.includes('sat-tinh')) return s.dacTinh && s.dacTinh !== 'H' ? -0.4 : -1.5;
  if (def.id === 'hoa-ky') return s.dacTinh === 'Đ' ? -0.3 : -1.5;
  if (def.tags.includes('tam-hoa')) return 1.5;
  if (def.tags.includes('luc-cat') || def.id === 'loc-ton') return 1.2;
  if (def.loai === 'vong-trang-sinh') return { 'trang-sinh': 0.6, 'de-vuong': 0.6, 'lam-quan': 0.4, 'tuyet': -0.4, 'tu': -0.3, 'benh': -0.3 }[def.id] ?? 0;
  if (def.nhom === 'cat') return 0.4;
  if (def.nhom === 'hung') return -0.6;
  return 0;
}
export function diemCung(chart: Chart, chi: number, luu?: Record<number, StarInChart[]>): number {
  const P = chart.palaces;
  const sum = (c: number) => [...P[c].stars, ...(luu?.[c] || []).filter((s) => !s.id.endsWith('tuan') && !s.id.endsWith('triet'))].reduce((a, s) => a + diemSao(s), 0);
  let d = sum(chi) + 0.5 * (sum(xung(chi)) + sum(tamHop(chi)[0]) + sum(tamHop(chi)[1]));
  if (P[chi].vcd) d -= 1;
  const tt = (P[chi].tuan ? 1 : 0) + (P[chi].triet ? 1 : 0);
  if (tt) d *= 0.65; // Tuần Triệt trấn áp: giảm cả tốt lẫn xấu (tr.73)
  return Math.round(d * 10) / 10;
}
export function xepLoai(d: number): string {
  if (d >= 9) return 'Rất mạnh';
  if (d >= 5) return 'Mạnh';
  if (d >= 1.5) return 'Khá';
  if (d >= -1.5) return 'Trung bình';
  if (d >= -4) return 'Yếu';
  return 'Rất yếu';
}

// ───────────────────────────────────────────── Tiện ích mô tả sao
function moTaSao(s: StarInChart, cungTen: string, kb: KB): string {
  const info: StarInfo = kb.stars[s.base || s.id] || {};
  const parts: string[] = [];
  const tc = info.taiCung?.[cungTen];
  if (tc) parts.push(tc);
  else if (info.tomTat) parts.push(info.tomTat);
  if (s.dacTinh && ['M', 'V', 'Đ'].includes(s.dacTinh) && info.khiSang) parts.push(info.khiSang);
  if (s.dacTinh === 'H' && info.khiHam) parts.push(info.khiHam);
  return parts.join(' ');
}
function saoView(s: StarInChart, cungTen: string, kb: KB): SaoView {
  return { id: s.id, ten: s.ten, dacTinh: s.dacTinh, nhom: s.nhom, loai: s.loai, y: moTaSao(s, cungTen, kb) };
}
const tenSao = (s: StarInChart) => s.ten + (s.dacTinh ? ` (${TEN_DAC[s.dacTinh]})` : '');
const chinhTinh = (p: Palace) => p.stars.filter((s) => s.loai === 'chinh');
const coSao = (p: Palace, ...ids: string[]) => p.stars.some((s) => ids.includes(s.id));
const hitsOf = (p: Palace, ids: string[]): Hit[] => p.stars.filter((s) => ids.includes(s.id)).map((s) => ({ chi: p.chi, id: s.id }));
function findStar(chart: Chart, id: string): Palace {
  return chart.palaces.find((p) => p && p.stars.some((s) => s.id === id));
}

// ───────────────────────────────────────────── BƯỚC 1: Tổng quan
function tongQuan(chart: Chart, kb: KB): Muc[] {
  const tb = chart.thienBan;
  const P = chart.palaces;
  const out: Muc[] = [];
  const menhP = P[tb.cungMenh];
  const thanP = P[tb.cungThan];

  // 1. Can – Chi năm sinh
  const hCan = HANH_CAN[tb.canNam];
  const hChi = HANH_CHI[tb.chiNam];
  const qh = quanHe(hCan, hChi);
  const CANCHI: Record<QuanHe, [string, DanhGia, string]> = {
    hoa: ['Can Chi tương hòa', 'cat', 'Bản mệnh có căn bản vững chãi, có đủ khả năng để đạt được điều mình mong muốn.'],
    duocSinh: ['Chi sinh Can', 'cat', 'Bản mệnh gặt hái thành công nhờ may mắn, còn thực lực có thể chưa đạt đến mức ấy.'],
    sinh: ['Can sinh Chi', 'cat', 'Người được trời ưu đãi để làm việc, vừa có khả năng vừa gặp may nên thành công dễ dàng.'],
    khac: ['Can khắc Chi', 'hung', 'Người hay gặp nhiều nghịch cảnh, dễ đổ vỡ sự nghiệp; cần bền bỉ, giữ gìn thành quả.'],
    biKhac: ['Chi khắc Can', 'trung', 'Bản mệnh thành công trong khó khăn, ít gặp may mắn — thành quả do tự lực mà có.'],
  };
  const [t1, d1, n1] = CANCHI[qh];
  out.push({ key: 'can-chi', tieuDe: 'Sinh khắc Can – Chi năm sinh', giaTri: `${tb.canChi.nam}: Can ${hCan} – Chi ${hChi} → ${t1}`, danhGia: d1, noiDung: n1 });

  // 2. Mệnh – Cục
  const qmc = quanHe(tb.cuc.hanh, tb.menh.hanh); // nhìn từ Cục
  const MC: Record<QuanHe, [string, DanhGia, string]> = {
    sinh: ['Cục sinh Mệnh', 'cat', 'Bản mệnh được hoàn cảnh ưu đãi, gặp nhiều điều may mắn, thuận lợi.'],
    hoa: ['Mệnh Cục tương hòa', 'cat', 'Người dễ hòa mình với hoàn cảnh, với đời sống bên ngoài.'],
    duocSinh: ['Mệnh sinh Cục', 'trung', 'Bản mệnh vất vả, hay phải làm lợi cho thiên hạ; công sức bỏ ra nhiều hơn phần hưởng.'],
    biKhac: ['Mệnh khắc Cục', 'hung', 'Cuộc đời có nhiều trở ngại, khó thành đại sự nếu không có sao tốt phù trợ.'],
    khac: ['Cục khắc Mệnh', 'hung', 'Người sinh không gặp thời, muốn thành công phải trải qua gian khổ.'],
  };
  const [t2, d2, n2] = MC[qmc];
  out.push({
    key: 'menh-cuc', tieuDe: 'Tương quan Mệnh – Cục',
    giaTri: `Mệnh ${tb.menh.napAm} (${tb.menh.hanh}) – ${tb.cuc.ten} → ${t2}`, danhGia: d2,
    noiDung: n2 + ' Theo sách, Mệnh Cục tương khắc kèm âm dương nghịch lý thường chỉ đạt trung cách (tr.97).',
  });

  // 3. Âm dương
  out.push({
    key: 'am-duong', tieuDe: 'Âm dương', giaTri: `${tb.amDuongTen} – ${tb.amDuongLy.text}`, danhGia: tb.amDuongLy.thuan ? 'cat' : 'trung', trang: 100,
    noiDung: tb.amDuongLy.thuan
      ? 'Mệnh Dương cư cung Dương / Mệnh Âm cư cung Âm: độ số gia tăng, mọi việc thuận chiều hơn.'
      : 'Âm dương nghịch lý: độ số bị chiết giảm ít nhiều, việc thành thường chậm và phải gắng sức hơn.',
    cung: [tb.cungMenh],
  });

  // 4. Mệnh tọa Sinh – Vượng – Bại – Tuyệt địa (tr.94)
  const SVBT: Record<Hanh, number[]> = { Kim: [6, 10, 7, 3], Mộc: [12, 4, 1, 9], Hỏa: [3, 7, 4, 12], Thủy: [9, 1, 10, 6], Thổ: [9, 1, 10, 6] };
  const idx = SVBT[tb.menh.hanh].indexOf(tb.cungMenh);
  const svbtTen = ['Sinh địa', 'Vượng địa', 'Bại địa', 'Tuyệt địa'];
  if (idx >= 0) {
    out.push({
      key: 'svbt', tieuDe: 'Mệnh đóng nơi Sinh/Vượng/Bại/Tuyệt', giaTri: `Mệnh ${tb.menh.hanh} an tại ${CHI[tb.cungMenh]}: ${svbtTen[idx]}`,
      danhGia: idx < 2 ? 'cat' : 'hung', trang: 94, cung: [tb.cungMenh],
      noiDung: idx < 2
        ? 'Mệnh an nơi sinh vượng của bản mệnh: gốc rễ vững, có sức bật.'
        : 'Gặp Bại hay Tuyệt địa: cuộc đời dễ chìm nổi vô thường, cần Tam Hóa hội hoặc chính diệu sinh được bản mệnh để cứu giải ("Tuyệt xứ phùng sinh").',
    });
  } else {
    out.push({ key: 'svbt', tieuDe: 'Mệnh đóng nơi Sinh/Vượng/Bại/Tuyệt', giaTri: `Mệnh ${tb.menh.hanh} an tại ${CHI[tb.cungMenh]}: không rơi vào 4 vị trí đặc biệt`, danhGia: 'trung', trang: 94, noiDung: 'Không chịu ảnh hưởng đặc biệt của sinh/vượng/bại/tuyệt địa.' });
  }

  // 5. Mùa sinh, giờ sinh (tr.96)
  const mua = muaSinh(tb.amLich.thangTinh);
  const VUONG: Record<string, Hanh> = { Xuân: 'Mộc', Hạ: 'Hỏa', Thu: 'Kim', Đông: 'Thủy' };
  const TUONG: Record<string, Hanh> = { Xuân: 'Hỏa', Hạ: 'Thổ', Thu: 'Thủy', Đông: 'Mộc' };
  const muaTxt = VUONG[mua] === tb.menh.hanh ? 'Mệnh Vượng (thuận mùa sinh)' : TUONG[mua] === tb.menh.hanh ? 'Mệnh Tướng (thuận mùa sinh)' : 'không được mùa';
  const GIO_THUAN: Record<string, number[]> = { Xuân: [10, 5, 6], Hạ: [4, 8, 12], Thu: [7, 9, 3], Đông: [2, 11, 1] };
  const gioThuan = GIO_THUAN[mua].includes(tb.chiGio);
  const gioLy = (tb.chiGio % 2) === (tb.cungMenh % 2);
  out.push({
    key: 'mua-gio', tieuDe: 'Mùa sinh – giờ sinh', trang: 96,
    giaTri: `Sinh mùa ${mua}, Mệnh ${tb.menh.hanh}: ${muaTxt}; giờ ${CHI[tb.chiGio]} ${gioThuan ? 'thuận' : 'không thuận'} mùa; giờ ${gioLy ? 'thuận lý' : 'nghịch lý'} với cung Mệnh`,
    danhGia: (muaTxt.includes('thuận') ? 1 : 0) + (gioThuan ? 1 : 0) + (gioLy ? 1 : 0) >= 2 ? 'cat' : 'trung',
    noiDung: 'Thuận mùa sinh, thuận giờ sinh, giờ sinh thuận lý (giờ Dương – Mệnh cung Dương, giờ Âm – Mệnh cung Âm) thì độ số gia tăng; nghịch thì kém bớt.',
  });

  // 6. Soát giờ sinh (tr.89-90)
  const canhBao: string[] = [];
  const ks = dich(11, tb.chiNam - 1, -(tb.amLich.thangTinh - 1), tb.amLich.ngay - 1, -(tb.chiGio - 1));
  if ((tb.gioiTinh === 'nam' && [5, 11].includes(ks)) || (tb.gioiTinh === 'nu' && [2, 8].includes(ks))) canhBao.push('giờ Kim Xà Thiết Tỏa (thuở nhỏ khó nuôi, qua 12 tuổi mới yên; xem cung Phúc để biết mức cứu giải)');
  if (tb.chiGio === dich(6, tb.amLich.thangTinh - 1)) canhBao.push('giờ Quan Sát (trẻ hay ốm yếu)');
  const TQ: Record<string, number[]> = { Xuân: [5, 11, 10], Hạ: [1, 4, 8], Thu: [3, 7, 2], Đông: [9, 6, 12] };
  if (TQ[mua].includes(tb.chiGio)) canhBao.push('giờ Tướng Quân (trẻ khó ngủ, hay lên kinh nhưng không nguy hiểm)');
  const DV: Record<string, number[]> = { Xuân: [2, 8], Hạ: [5, 11], Thu: [1, 7], Đông: [4, 10] };
  if (DV[mua].includes(tb.chiGio)) canhBao.push('giờ Diêm Vương (trẻ hay giật mình về đêm, vẫn nuôi được)');
  const DD: Record<string, number> = { Xuân: 7, Hạ: 10, Thu: 1, Đông: 4 };
  if (DD[mua] === tb.chiGio) canhBao.push('giờ Dạ Đề (trẻ hay khóc đêm)');
  const n = tb.chiNam, g = tb.chiGio;
  if ([3, 7, 6, 10].includes(n) && [5, 11, 2, 8].includes(g)) canhBao.push('tuổi Dần/Ngọ/Tỵ/Dậu sinh giờ Thìn/Tuất/Sửu/Mùi: giờ "tối độc"');
  if ([3, 12, 1].includes(n) && [7, 9, 10, 12].includes(g)) canhBao.push('tuổi Dần/Hợi/Tý sinh giờ Ngọ/Thân/Dậu/Hợi: khắc cha, đến 16 tuổi mới qua');
  if ([5, 6, 2, 8].includes(n) && [1, 7, 4, 6, 12, 9, 10].includes(g)) canhBao.push('tuổi Thìn/Tỵ/Sửu/Mùi sinh giờ Tý/Ngọ/Mão/Tỵ/Hợi/Thân/Dậu: khắc mẹ');
  out.push({
    key: 'soat-gio', tieuDe: 'Soát giờ sinh', trang: '89–96', danhGia: canhBao.length ? 'hung' : 'cat',
    giaTri: canhBao.length ? `Phạm ${canhBao.length} giờ kỵ` : 'Không phạm giờ kỵ',
    noiDung: canhBao.length ? 'Phạm: ' + canhBao.join('; ') + '.' : 'Không phạm Kim Xà, Quan Sát, Tướng Quân, Diêm Vương, Dạ Đề.',
  });

  // 7. Thế đứng chính tinh
  const ctMenh = chinhTinh(menhP);
  const NHOM: [string, string, string][] = [
    ['tu-phu-vu-tuong', 'Tử Phủ Vũ Tướng', 'bộ sao của người lãnh đạo, quản trị, giữ của – ổn định, đường đường chính chính.'],
    ['sat-pha-liem-tham', 'Sát Phá Liêm Tham', 'bộ sao của người hành động, mạo hiểm, thay đổi lớn – thăng trầm mạnh, thành bại đều nhanh.'],
    ['co-nguyet-dong-luong', 'Cơ Nguyệt Đồng Lương', 'bộ sao của người mưu trí, hiền hòa, hợp làm công chức, chuyên môn, tham mưu.'],
    ['cu-nhat', 'Cự Nhật', 'bộ sao của người ăn nói, lý luận, nghề dùng lời nói, ngoại giao, luật, giáo dục.'],
  ];
  const tp = [tb.cungMenh, xung(tb.cungMenh), ...tamHop(tb.cungMenh)];
  const ctTamPhuong = tp.flatMap((c) => chinhTinh(P[c]));
  const demNhom = NHOM.map(([tag, ten, y]) => ({ ten, y, n: ctTamPhuong.filter((s) => CATALOG.byId[s.id].tags.includes(tag)).length, tag }));
  demNhom.sort((a, b) => b.n - a.n);
  const nhomChinh = demNhom[0];
  const tuVi = findStar(chart, 'tu-vi');
  const phu = findStar(chart, 'thien-phu');
  const nhat = findStar(chart, 'thai-duong').stars.find((s) => s.id === 'thai-duong');
  const nguyet = findStar(chart, 'thai-am').stars.find((s) => s.id === 'thai-am');
  const nhatP = findStar(chart, 'thai-duong');
  const nguyetP = findStar(chart, 'thai-am');
  const satP = findStar(chart, 'that-sat');
  const sang = (s: StarInChart) => ['M', 'V', 'Đ'].includes(s.dacTinh);
  out.push({
    key: 'chinh-tinh', tieuDe: 'Thế đứng các chính tinh',
    giaTri: menhP.vcd ? `Mệnh vô chính diệu (mượn ${chinhTinh(P[xung(tb.cungMenh)]).map(tenSao).join(', ') || '—'} xung chiếu)` : `Mệnh: ${ctMenh.map(tenSao).join(', ')}`,
    danhGia: ctMenh.length && ctMenh.every(sang) ? 'cat' : ctMenh.some((s) => s.dacTinh === 'H') ? 'hung' : 'trung',
    noiDung: [
      `Tam phương tứ chính của Mệnh thuộc bộ ${nhomChinh.ten} (${nhomChinh.n} sao) — ${nhomChinh.y}`,
      `Tử Vi tại ${tuVi.chiTen} (${tuVi.ten}), Thiên Phủ tại ${phu.chiTen} (${phu.ten})${tuVi.chi === phu.chi ? ' — Tử Phủ đồng cung' : tuVi.chi === xung(phu.chi) ? ' — Tử Phủ xung chiếu' : ''}.`,
      `Thất Sát tại ${satP.chiTen} (${satP.ten}).`,
      `Thái Dương ${TEN_DAC[nhat.dacTinh]} tại ${nhatP.chiTen}, Thái Âm ${TEN_DAC[nguyet.dacTinh]} tại ${nguyetP.chiTen}: ` +
        (sang(nhat) && sang(nguyet) ? 'Nhật Nguyệt đều sáng — cha mẹ, bản thân được phù trợ, minh mẫn.' : !sang(nhat) && !sang(nguyet) ? 'Nhật Nguyệt đều tối — dễ thiếu sự che chở, cần sao giải cứu (tr.93 "Nhật Nguyệt tàng hung" nếu hãm tại Mệnh).' : 'Nhật Nguyệt một sáng một tối — phúc phần không đồng đều giữa cha và mẹ, nam và nữ.'),
      `Mệnh chủ: ${tb.menhChu}, Thân chủ: ${tb.thanChu}.`,
    ].join(' '),
    hits: [...hitsOf(menhP, ctMenh.map((s) => s.id)), ...hitsOf(tuVi, ['tu-vi']), ...hitsOf(phu, ['thien-phu']), ...hitsOf(nhatP, ['thai-duong']), ...hitsOf(nguyetP, ['thai-am'])],
    cung: [tb.cungMenh],
  });

  // 8. Thế đứng các cung
  const cungTxt = ['Mệnh', 'Quan Lộc', 'Tài Bạch', 'Thiên Di', 'Phúc Đức', 'Phu Thê'].map((t) => {
    const p = P.find((x) => x && x.ten === t);
    return `${t} ở ${p.chiTen}${p.vcd ? ' (VCĐ)' : ': ' + chinhTinh(p).map((s) => s.ten).join(', ')}`;
  });
  const THAN_CU: Record<string, string> = {
    'Mệnh': 'Mệnh Thân đồng cung: tính cách nhất quán, cuộc đời ít thay đổi bản chất; tốt xấu đều tập trung vào cung Mệnh.',
    'Thiên Di': 'Thân cư Thiên Di: có cát tinh hội thì lập nghiệp phương xa thịnh vượng; gặp Tuần Triệt án ngữ dễ chết xa nhà (tr.95).',
    'Phu Thê': 'Thân cư Phu Thê: đời sống gắn chặt với hôn nhân; có Thái Âm tọa thủ thì nhờ vợ (sợ vợ); Tuần Triệt thì trắc trở hôn nhân (tr.95).',
    'Tài Bạch': 'Thân cư Tài Bạch: lấy tiền tài làm trọng; sáng sủa với cát tinh thì có danh giá hoặc tiền tài; Song Hao, Quyền Lộc, Kiếp, Hỏa hội thì buôn bán giàu có (tr.95).',
    'Quan Lộc': 'Thân cư Quan Lộc: sống vì sự nghiệp; gặp Tuần Triệt, Kiếp Hỏa, Kỵ thì muộn công danh, có cát tinh cũng phải ngoài 40 mới hanh thông (tr.95).',
    'Phúc Đức': 'Thân cư Phúc Đức: hưởng phúc ông bà; cung Phúc sáng sủa thì sống lâu, hưởng phúc; mờ ám thì giảm thọ, tai ương (tr.95).',
  };
  out.push({
    key: 'the-cung', tieuDe: 'Thế đứng các cung', giaTri: `Thân cư ${tb.thanCu} (${thanP.chiTen})`, danhGia: 'trung',
    noiDung: cungTxt.join('; ') + '. ' + (THAN_CU[tb.thanCu] || ''),
    cung: [tb.cungMenh, tb.cungThan],
  });

  // 9. Bố cục trung tinh, phụ tinh
  const viTri = (ids: string[]) =>
    ids.map((id) => {
      const p = findStar(chart, id);
      return p ? `${CATALOG.byId[id].ten} ${p.chiTen}${p.ten === 'Mệnh' ? '★' : ''}` : '';
    }).filter(Boolean).join(', ');
  const tpMenh = new Set(tp);
  const demTP = (tag: string) => [...tpMenh].flatMap((c) => P[c].stars.filter((s) => CATALOG.byId[s.id].tags.includes(tag)));
  const cat = demTP('luc-cat'), sat = demTP('luc-sat'), hoa = demTP('tam-hoa');
  const ky = [...tpMenh].flatMap((c) => P[c].stars.filter((s) => s.id === 'hoa-ky'));
  out.push({
    key: 'trung-tinh', tieuDe: 'Bố cục trung tinh – phụ tinh',
    giaTri: `Tam phương Mệnh: ${cat.length} lục cát, ${hoa.length} sao Tam Hóa, ${sat.length} lục sát${ky.length ? ', có Hóa Kỵ' : ''}`,
    danhGia: cat.length + hoa.length > sat.length + ky.length ? 'cat' : cat.length + hoa.length < sat.length + ky.length ? 'hung' : 'trung',
    noiDung: [
      `Lục cát — ${viTri(['ta-phu', 'huu-bat', 'van-xuong', 'van-khuc', 'thien-khoi', 'thien-viet'])}.`,
      `Tứ hóa — ${viTri(['hoa-loc', 'hoa-quyen', 'hoa-khoa', 'hoa-ky'])}.`,
      `Lộc Mã — ${viTri(['loc-ton', 'thien-ma'])}. Long Phượng — ${viTri(['long-tri', 'phuong-cac'])}. Quang Quý — ${viTri(['an-quang', 'thien-quy'])}.`,
      `Lục sát — ${viTri(['kinh-duong', 'da-la', 'hoa-tinh', 'linh-tinh', 'dia-khong', 'dia-kiep'])}.`,
      `Thiên Hình — ${viTri(['thien-hinh'])}, Thái Tuế — ${viTri(['thai-tue'])}, Kiếp Sát — ${viTri(['kiep-sat'])}, Thanh Long — ${viTri(['thanh-long'])}.`,
    ].join(' '),
    hits: [...cat, ...hoa, ...sat, ...ky].map((s) => ({ chi: [...tpMenh].find((c) => P[c].stars.includes(s)), id: s.id })),
    cung: tp,
  });

  // 10. Vòng Tràng Sinh, Khốc Hư, Tang Hổ
  const tsMenh = menhP.stars.find((s) => s.loai === 'vong-trang-sinh');
  const tsThan = thanP.stars.find((s) => s.loai === 'vong-trang-sinh');
  const TS_Y: Record<string, string> = {
    'trang-sinh': 'sinh khí dồi dào, sống lâu, phát triển bền', 'moc-duc': 'ưa chưng diện, dễ sa đà tửu sắc, đổi thay', 'quan-doi': 'thành đạt, có danh phận', 'lam-quan': 'tự lập, đắc thế',
    'de-vuong': 'khí vượng cực thịnh, có thế lực', suy: 'khí suy, thiếu nghị lực', benh: 'hay đau yếu, việc dở dang', tu: 'trầm lặng, ít may', mo: 'giữ của, tích lũy, chậm phát', tuyet: 'khí đã tuyệt, dễ bế tắc', thai: 'non nớt, dễ thay đổi', duong: 'được nuôi dưỡng, nhờ người',
  };
  const khoc = findStar(chart, 'thien-khoc'), hu = findStar(chart, 'thien-hu'), tang = findStar(chart, 'tang-mon'), ho = findStar(chart, 'bach-ho');
  out.push({
    key: 'trang-sinh', tieuDe: 'Vòng Tràng Sinh – Khốc Hư – Tang Hổ',
    giaTri: `Mệnh gặp ${tsMenh?.ten}, Thân gặp ${tsThan?.ten}`,
    danhGia: ['trang-sinh', 'de-vuong', 'lam-quan', 'quan-doi'].includes(tsMenh?.id) ? 'cat' : ['tuyet', 'tu', 'benh'].includes(tsMenh?.id) ? 'hung' : 'trung',
    noiDung: `${tsMenh?.ten} tại Mệnh: ${TS_Y[tsMenh?.id] || ''}. Khốc tại ${khoc.chiTen} (${khoc.ten}), Hư tại ${hu.chiTen} (${hu.ten}) — ` +
      `${[khoc.chi, hu.chi].some((c) => tpMenh.has(c)) ? 'Khốc Hư chiếu Mệnh: tính hay lo nghĩ, đời nhiều phen buồn khổ (đắc địa ở Tý Ngọ Mão Dậu thì lại phấn chấn, có danh).' : 'Khốc Hư không chiếu Mệnh.'} ` +
      `Tang Môn tại ${tang.chiTen} (${tang.ten}), Bạch Hổ tại ${ho.chiTen} (${ho.ten}) — ${[tang.chi, ho.chi].some((c) => tpMenh.has(c)) ? 'Tang Hổ hội Mệnh: tính cương, gặp nhiều tang thương, đề phòng tai nạn máu me.' : 'Tang Hổ không hội Mệnh.'}`,
    hits: [...hitsOf(menhP, [tsMenh?.id]), ...hitsOf(khoc, ['thien-khoc']), ...hitsOf(hu, ['thien-hu']), ...hitsOf(tang, ['tang-mon']), ...hitsOf(ho, ['bach-ho'])],
  });

  // 11. Tuần Triệt
  const tuanC = P.filter((p) => p?.tuan), trietC = P.filter((p) => p?.triet);
  out.push({
    key: 'tuan-triet', tieuDe: 'Tuần – Triệt', trang: '73–74', danhGia: 'trung',
    giaTri: `Tuần: ${tuanC.map((p) => `${p.chiTen} (${p.ten})`).join(', ')}; Triệt: ${trietC.map((p) => `${p.chiTen} (${p.ten})`).join(', ')}`,
    noiDung: 'Tuần, Triệt trấn áp: gặp sao tốt thì giảm tốt, gặp sao xấu lại giảm xấu. Tuần (dương) tác động mạnh ở cung dương, đắc địa ở Dần Mão; Triệt (âm) mạnh ở cung âm, đắc địa ở Thân Dậu ("Triệt đáo Kim cung"). Ở Ngọ Mùi gây tính khoan hòa nhân hậu. Ngoài 32 tuổi ảnh hưởng Tuần Triệt gốc yếu dần, phải xét Tuần Triệt lưu niên.' +
      (menhP.tuan || menhP.triet ? ` Mệnh bị ${menhP.tuan ? 'Tuần' : ''}${menhP.tuan && menhP.triet ? ' – ' : ''}${menhP.triet ? 'Triệt' : ''} án ngữ: thuở trẻ nhiều trở ngại, sao tốt ở Mệnh bị giảm lực.` : ''),
    cung: [...tuanC, ...trietC].map((p) => p.chi),
  });

  // 12. Hình tướng – bệnh tật (dựa sao tọa Mệnh và Tật Ách)
  const tatP = P.find((p) => p && p.ten === 'Tật Ách');
  const hinh = [...ctMenh, ...(menhP.vcd ? chinhTinh(P[xung(tb.cungMenh)]) : [])].map((s) => kb.stars[s.id]?.ngoaiHinh).filter(Boolean);
  const benh = tatP.stars.filter((s) => s.loai === 'chinh' || s.nhom === 'hung').map((s) => (kb.stars[s.id]?.boPhan ? `${s.ten}: ${kb.stars[s.id].boPhan}` : '')).filter(Boolean);
  if (hinh.length || benh.length)
    out.push({
      key: 'hinh-benh', tieuDe: 'Hình dáng – bệnh tật', danhGia: 'trung',
      giaTri: `Tật Ách tại ${tatP.chiTen}: ${tatP.stars.filter((s) => s.loai === 'chinh').map((s) => s.ten).join(', ') || 'VCĐ'}`,
      noiDung: (hinh.length ? 'Hình dáng: ' + hinh.join(' ') + ' ' : '') + (benh.length ? 'Bộ phận cần lưu ý (theo sao ở Tật Ách): ' + benh.join('; ') + '.' : ''),
      cung: [tb.cungMenh, tatP.chi],
    });

  return out;
}

// ───────────────────────────────────────────── BƯỚC 2: Phân tích từng cung
function thuTuCung(chart: Chart): string[] {
  const nam = ['Mệnh', 'Thân', 'Phúc Đức', 'Quan Lộc', 'Tài Bạch', 'Thiên Di', 'Phu Thê'];
  const nu = ['Mệnh', 'Thân', 'Phúc Đức', 'Phu Thê', 'Tài Bạch', 'Tử Tức'];
  const dau = chart.thienBan.gioiTinh === 'nam' ? nam : nu;
  return [...dau, ...TEN_CUNG.filter((t) => !dau.includes(t))];
}

function phanTichCung(chart: Chart, chi: number, kb: KB, matches: RuleMatch[], laThan = false): CungView {
  const tb = chart.thienBan;
  const P = chart.palaces;
  const p = P[chi];
  const tenHienThi = laThan ? `Thân (cư ${p.ten})` : p.ten;
  const [h1, h2] = tamHop(chi);
  const [g1, g2] = giap(chi);
  const ctList = (c: number) => chinhTinh(P[c]).map((s) => s.ten).join(', ') || 'VCĐ';
  const viTri: Muc[] = [
    { key: 'vt', tieuDe: 'Vị trí', noiDung: `${p.ten} an tại ${p.canTen} ${p.chiTen} (hành ${p.hanh}, cung ${p.amDuong === 1 ? 'Dương' : 'Âm'}).` },
    { key: 'th', tieuDe: 'Tam hợp', noiDung: `${P[h1].ten} (${P[h1].chiTen}: ${ctList(h1)}) và ${P[h2].ten} (${P[h2].chiTen}: ${ctList(h2)}).`, cung: [h1, h2] },
    { key: 'xc', tieuDe: 'Xung chiếu', noiDung: `${P[xung(chi)].ten} (${P[xung(chi)].chiTen}: ${ctList(xung(chi))}).`, cung: [xung(chi)] },
    { key: 'nh', tieuDe: 'Nhị hợp', noiDung: `${P[nhiHop(chi)].ten} (${P[nhiHop(chi)].chiTen}: ${ctList(nhiHop(chi))}).`, cung: [nhiHop(chi)] },
    { key: 'gi', tieuDe: 'Giáp', noiDung: `${P[g1].ten} (${P[g1].stars.filter((s) => s.loai === 'chinh' || CATALOG.byId[s.id].tags.some((t) => ['luc-cat', 'luc-sat', 'tam-hoa', 'loc'].includes(t))).map((s) => s.ten).join(', ') || '—'}) và ${P[g2].ten} (${P[g2].stars.filter((s) => s.loai === 'chinh' || CATALOG.byId[s.id].tags.some((t) => ['luc-cat', 'luc-sat', 'tam-hoa', 'loc'].includes(t))).map((s) => s.ten).join(', ') || '—'}).`, cung: [g1, g2] },
  ];
  const ct = chinhTinh(p);
  let muonSao: string;
  let ctXet = ct;
  if (p.vcd) {
    ctXet = chinhTinh(P[xung(chi)]);
    muonSao = `Vô chính diệu — mượn chính tinh cung xung chiếu ${P[xung(chi)].chiTen}: ${ctXet.map(tenSao).join(', ') || 'không có'}. Cung VCĐ thường kém vững, nhưng gặp Tam Không (Tuần, Triệt, Thiên/Địa Không) hội cát tinh và Nhật Nguyệt chiếu lại thành cách tốt (tr.97).`;
  }
  // Ngũ hành sao – cung – mệnh (tr.100)
  const nguHanh: Muc[] = [];
  for (const s of ctXet) {
    const qCung = quanHe(p.hanh, s.hanh);
    const qMenh = quanHe(s.hanh, tb.menh.hanh);
    let dg: DanhGia = 'trung';
    let y = '';
    if (qCung === 'sinh' || qCung === 'hoa') { dg = 'cat'; y = 'cung sinh/hòa sao, sao được đất'; }
    if (qCung === 'khac' || qCung === 'biKhac') { dg = 'hung'; y = 'cung và sao khắc nhau, độ số kém'; }
    if (qMenh === 'sinh') y += (y ? '; ' : '') + 'sao sinh bản mệnh — tốt';
    if (qMenh === 'khac') { y += (y ? '; ' : '') + 'sao khắc bản mệnh — kém'; dg = dg === 'cat' ? 'trung' : 'hung'; }
    if (qMenh === 'duocSinh') y += (y ? '; ' : '') + 'bản mệnh sinh sao — độ số kém tốt bớt';
    nguHanh.push({
      key: 'nh-' + s.id, tieuDe: `${s.ten} (${s.hanh})`, danhGia: dg, trang: 100,
      noiDung: `Cung ${p.hanh} ${QH_TEXT[qCung]} sao ${s.hanh}; sao ${s.hanh} ${QH_TEXT[qMenh]} Mệnh ${tb.menh.hanh}: ${y || 'bình thường'}.`,
    });
  }
  let tuanTriet: Muc;
  if (p.tuan || p.triet) {
    const ten = p.tuan && p.triet ? 'Tuần Triệt' : p.tuan ? 'Tuần' : 'Triệt';
    const ctSang = ct.filter((s) => ['M', 'V', 'Đ'].includes(s.dacTinh)).length;
    const ctHam = ct.filter((s) => s.dacTinh === 'H').length;
    let y = `${ten} án ngữ: `;
    if (p.triet && [9, 10].includes(chi)) y += 'Triệt đáo Kim cung — không trấn áp mà còn giúp sao trong cung tốt đẹp. ';
    else if (p.tuan && [3, 4].includes(chi)) y += 'Tuần đắc địa ở Dần Mão — có thể đem lại hoạnh phát. ';
    else if ([7, 8].includes(chi)) y += 'đóng Ngọ Mùi — ảnh hưởng êm đềm, khoan hòa, nhân hậu. ';
    else if (ctSang > ctHam) y += 'sao tốt bị giảm lực, việc của cung này đến muộn hoặc trắc trở lúc đầu. ';
    else if (ctHam > 0 || p.vcd) y += 'sao hãm/xấu lại được giảm bớt cái xấu — "hung hóa cát" một phần. ';
    else y += 'giảm cả tốt lẫn xấu. ';
    y += 'Ảnh hưởng mạnh trước 32 tuổi (tr.73).';
    tuanTriet = { key: 'tt', tieuDe: ten, noiDung: y, trang: 73, danhGia: 'trung' };
  }
  const own = matches.filter((m) => m.chi === chi && (laThan ? arr(m.rule.cung).includes('Thân') : !arr(m.rule.cung).includes('Thân') || arr(m.rule.cung).includes(p.ten)));
  const luat = own.map((m) => toView(m, chart)).sort((a, b) => b.mucDo - a.mucDo);
  const diem = diemCung(chart, chi);
  const chinhTxt = ct.length ? ct.map(tenSao).join(', ') : 'vô chính diệu';
  const catTxt = p.stars.filter((s) => s.loai !== 'chinh' && s.nhom === 'cat' && CATALOG.byId[s.id].tags.length).map((s) => s.ten);
  const hungTxt = p.stars.filter((s) => CATALOG.byId[s.id].tags.some((t) => ['luc-sat', 'hung-tinh'].includes(t)) || s.id === 'hoa-ky').map((s) => s.ten);
  const tomTat = `${tenHienThi} tại ${p.chiTen}: ${chinhTxt}. ` + (catTxt.length ? `Cát tinh: ${catTxt.join(', ')}. ` : '') + (hungTxt.length ? `Hung/sát tinh: ${hungTxt.join(', ')}. ` : '') + `Đánh giá chung: ${xepLoai(diem).toLowerCase()}.`;
  const order = (s: StarInChart) => (s.loai === 'chinh' ? 0 : CATALOG.byId[s.id].tags.some((t) => ['luc-cat', 'tam-hoa', 'luc-sat', 'loc', 'ma'].includes(t)) || s.id === 'hoa-ky' ? 1 : 2);
  return {
    chi, ten: tenHienThi, chiTen: p.chiTen, diem, xepLoai: xepLoai(diem), viTri,
    chinhTinh: ct.map((s) => saoView(s, p.ten, kb)),
    phuTinh: p.stars.filter((s) => s.loai !== 'chinh').sort((a, b) => order(a) - order(b)).map((s) => saoView(s, p.ten, kb)),
    muonSao, nguHanh, tuanTriet, luat, tomTat,
  };
}

const arr = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);
function toView(m: RuleMatch, chart: Chart): MatchView {
  return {
    id: m.rule.id, ten: m.rule.ten, loai: m.rule.loai, ketLuan: m.rule.ketLuan, nguyenVan: m.rule.nguyenVan,
    danhGia: m.rule.danhGia, mucDo: m.rule.mucDo, chuDe: m.rule.chuDe || [], trang: m.rule.trang,
    chi: m.chi, cungTen: chart.palaces[m.chi].ten, hits: m.hits, boi: m.boi,
  };
}

// ───────────────────────────────────────────── BƯỚC 3: Vận hạn
export interface DaiHanView {
  chi: number; ten: string; chiTen: string; tuTuoi: number; denTuoi: number; tuNam: number; denNam: number;
  diem: number; xepLoai: string; chinhTinh: string; luat: MatchView[]; dangChay: boolean;
}
function daiHanList(chart: Chart, kb: KB, tuoiHienTai: number): DaiHanView[] {
  const tb = chart.thienBan;
  const list = chart.palaces.slice(1).map((p) => {
    const m = apLuatHan(chart, kb, {}, p.chi, p.chi).filter((x) => x.boi === 'dai-han');
    return {
      chi: p.chi, ten: p.ten, chiTen: p.chiTen, tuTuoi: p.daiHan, denTuoi: p.daiHan + 9,
      tuNam: tb.amLich.nam + p.daiHan - 1, denNam: tb.amLich.nam + p.daiHan + 8,
      diem: diemCung(chart, p.chi), xepLoai: xepLoai(diemCung(chart, p.chi)),
      chinhTinh: chinhTinh(p).map(tenSao).join(', ') || 'VCĐ',
      luat: m.map((x) => toView(x, chart)).sort((a, b) => b.mucDo - a.mucDo),
      dangChay: tuoiHienTai >= p.daiHan && tuoiHienTai <= p.daiHan + 9,
    };
  });
  return list.sort((a, b) => a.tuTuoi - b.tuTuoi);
}

export interface NamXemView {
  luu: LuuNien;
  diemTieuHan: number;
  xepLoai: string;
  muc: Muc[];
  luat: MatchView[];
  thang: { thang: number; chi: number; ten: string; diem: number; xepLoai: string }[];
}
function namXemView(chart: Chart, kb: KB, namXem: number): NamXemView {
  const tb = chart.thienBan;
  const luu = tinhLuuNien(chart, namXem);
  const P = chart.palaces;
  const th = luu.tieuHan.chi;
  const muc: Muc[] = [];
  const dhTxt = luu.daiHan ? `Đại hạn ${luu.daiHan.tuTuoi}–${luu.daiHan.denTuoi} tại cung ${luu.daiHan.ten} (${CHI[luu.daiHan.chi]})` : luu.dongHan ? `Chưa vào đại hạn đầu; Đồng hạn ${luu.tuoi} tuổi tại ${luu.dongHan.ten}` : 'Ngoài các đại hạn';
  muc.push({ key: 'han', tieuDe: 'Vị trí hạn', noiDung: `${namXem} (${luu.canChi}) — ${luu.tuoi} tuổi. ${dhTxt}; Tiểu hạn tại cung ${luu.tieuHan.ten} (${CHI[th]}).`, cung: [luu.daiHan?.chi, th].filter(Boolean) });
  if (luu.daiHan && luu.daiHan.chi === th) muc.push({ key: 'trung-phung', tieuDe: 'Đại – Tiểu hạn trùng phùng', danhGia: 'trung', noiDung: 'Đại hạn và tiểu hạn cùng một cung: tốt xấu của cung ấy được nhân lên mạnh mẽ trong năm.' });
  // Hạn hành đắc số / phản bối (tr.104)
  const DAC: Record<Hanh, number[]> = { Hỏa: [3, 7, 6], Kim: [10, 9], Mộc: [12, 3, 4], Thủy: [9, 12, 1], Thổ: [9, 12, 1] };
  const PHAN: Record<Hanh, number[]> = { Mộc: [9, 10], Hỏa: [11, 12], Thủy: [5, 6], Thổ: [5, 6], Kim: [2, 3] };
  for (const [ten, c] of [['Đại hạn', luu.daiHan?.chi], ['Tiểu hạn', th]] as [string, number][]) {
    if (!c) continue;
    if (DAC[tb.menh.hanh].includes(c)) muc.push({ key: 'dac-' + ten, tieuDe: `${ten} đắc số`, danhGia: 'cat', trang: 104, noiDung: `Mệnh ${tb.menh.hanh} hành hạn đến ${CHI[c]} là đất hợp ("Hạn hành đắc số").` });
    if (PHAN[tb.menh.hanh].includes(c)) muc.push({ key: 'phan-' + ten, tieuDe: `${ten} phản bối`, danhGia: 'hung', trang: 104, noiDung: `Mệnh ${tb.menh.hanh} hành hạn đến ${CHI[c]} là đất phản bối, dễ trắc trở ("Hạn hành phản bối").` });
  }
  // Thái Tuế lưu gặp sao gốc
  const luuTai = (c: number) => (luu.luuSao[c] || []).map((s) => s.ten);
  muc.push({
    key: 'cuu-tinh', tieuDe: 'Cửu phi tinh & Tuần Triệt lưu', trang: '135–136',
    noiDung: `Tại cung tiểu hạn: ${luuTai(th).join(', ') || 'không có sao lưu'}. Lưu Tuần ở ${luu.luuTuan.map((c) => CHI[c]).join(' ')}, Lưu Triệt ở ${luu.luuTriet.map((c) => CHI[c]).join(' ')}.` +
      ((luu.luuSao[th] || []).some((s) => s.id === 'luu-thien-khoc') && (luu.luuSao[th] || []).some((s) => s.id === 'luu-thien-hu') ? ' Lưu Khốc Hư cùng về hạn: năm nhiều buồn phiền, nước mắt.' : '') +
      (P[th].stars.some((s) => s.id === 'thien-ma') && (luu.luuTuan.includes(th) || luu.luuTriet.includes(th)) ? ' Thiên Mã gặp Tuần/Triệt lưu: đi xa, thay đổi việc trắc trở.' : ''),
    cung: [th],
  });
  for (const g of luu.ghiChu) muc.push({ key: 'nb-' + muc.length, tieuDe: 'Nam/Bắc đẩu ở đại hạn', noiDung: g, trang: 137 });

  // Lưu đại hạn từng năm (tr.141): năm 1 tại cung đại hạn, năm 2 cung xung, năm 3 lùi một cung, năm 4 về cung xung, rồi đi theo chiều đại hạn
  if (luu.daiHan) {
    const k = luu.tuoi - luu.daiHan.tuTuoi + 1;
    const X = xung(luu.daiHan.chi);
    const dir = tb.thuanNghich;
    const c = k === 1 ? luu.daiHan.chi : k === 2 || k === 4 ? X : k === 3 ? dich(X, -dir) : dich(X, (k - 4) * dir);
    muc.push({ key: 'luu-dh', tieuDe: 'Lưu đại hạn năm nay', trang: 141, cung: [c], danhGia: 'trung',
      noiDung: `Năm thứ ${k} của đại hạn: lưu đại hạn đến cung ${P[c].ten} (${CHI[c]}) — ${chinhTinh(P[c]).map(tenSao).join(', ') || 'vô chính diệu'}; cung này chi phối việc lớn trong năm.` });
  }
  // Hạn đến cung trùng chi năm sinh (tr.143)
  for (const [ten, c] of [['Đại hạn', luu.daiHan?.chi], ['Tiểu hạn', th]] as [string, number][])
    if (c && c === tb.chiNam) muc.push({ key: 'nam-tuoi-' + ten, tieuDe: `${ten} đến cung năm tuổi`, trang: 143, danhGia: 'trung', cung: [c],
      noiDung: `${ten} đóng tại ${CHI[c]} trùng chi năm sinh: tốt hay xấu đều mạnh hơn các năm khác${luu.daiHan?.chi === th ? ', lại thêm đại tiểu hạn trùng phùng nên càng mạnh' : ''}.` });
  // Năm kỵ theo tuổi (tr.142-143)
  const NAM_KY: number[][] = [[], [3, 9, 1, 7], [2, 7], [6, 12, 4, 10], [6, 12, 4, 10], [5], [6], [2, 7], [10, 12], [3, 7], [4, 3], [6, 5, 11], [6]];
  if (NAM_KY[tb.chiNam].includes(luu.chiNam))
    muc.push({ key: 'nam-ky', tieuDe: 'Năm kỵ theo tuổi', trang: 142, danhGia: 'hung',
      noiDung: `Tuổi ${CHI[tb.chiNam]} kỵ năm ${NAM_KY[tb.chiNam].map((c) => CHI[c]).join(', ')}: năm ${luu.canChi} hay gặp tai ương vặt; nếu tiểu hạn cũng xấu thì rất đáng ngại.` });
  // Tương quan đại – tiểu hạn (tr.140,143) và nhãn Mệnh – Hạn (tr.142)
  if (luu.daiHan) {
    const dD = diemCung(chart, luu.daiHan.chi);
    const dT = diemCung(chart, th, luu.luuSao);
    const dM = diemCung(chart, tb.cungMenh);
    const ket = dD >= 1.5 && dT < -1.5 ? 'Đại hạn tốt nên giải được phần lớn cái xấu của tiểu hạn.' : dD < -1.5 && dT >= 1.5 ? 'Đại hạn xấu nên cái tốt của tiểu hạn bị chiết giảm nhiều.' : dD >= 1.5 && dT >= 1.5 ? 'Đại hạn và tiểu hạn cùng tốt: năm thuận lợi.' : dD < -1.5 && dT < -1.5 ? 'Đại hạn và tiểu hạn cùng xấu: năm cần hết sức thận trọng.' : 'Đại – tiểu hạn ở mức trung bình, tốt xấu đan xen.';
    const nhan = dM >= 5 && dD >= 5 ? 'Cẩm thượng thiêm hoa (Mệnh sáng, hạn rực rỡ)' : dM < 1.5 && dD >= 5 ? 'Phong vân tế hội (Mệnh tối, hạn rực rỡ)' : dM < 1.5 && dD >= 1.5 ? 'Khô mộc phùng xuân (Mệnh tối, hạn tốt vừa)' : '';
    muc.push({ key: 'dh-th', tieuDe: 'Đại hạn – Tiểu hạn', trang: '140–143', danhGia: dD + dT >= 3 ? 'cat' : dD + dT <= -3 ? 'hung' : 'trung',
      giaTri: `Đại hạn: ${xepLoai(dD)} · Tiểu hạn: ${xepLoai(dT)}${nhan ? ' · ' + nhan : ''}`, noiDung: ket, cung: [luu.daiHan.chi, th] });
  }

  const m = apLuatHan(chart, kb, luu.luuSao, luu.daiHan?.chi ?? null, th, luu.chiNam);
  const luat = m.map((x) => toView(x, chart)).sort((a, b) => (b.mucDo - a.mucDo) || (a.boi === 'tieu-han' ? -1 : 1));
  const thang = luu.luuNguyet.map((t) => ({ ...t, diem: diemCung(chart, t.chi, luu.luuSao), xepLoai: xepLoai(diemCung(chart, t.chi, luu.luuSao)) }));
  const d = diemCung(chart, th, luu.luuSao);
  return { luu, diemTieuHan: d, xepLoai: xepLoai(d), muc, luat, thang };
}

export function luanGiai(chart: Chart, kb: KB, namXem: number) {
  const matches = apLuatGoc(chart, kb);
  const tb = chart.thienBan;
  const cungViews: CungView[] = [];
  for (const ten of thuTuCung(chart)) {
    if (ten === 'Thân') {
      if (tb.cungThan === tb.cungMenh) continue;
      cungViews.push(phanTichCung(chart, tb.cungThan, kb, matches, true));
    } else {
      const p = chart.palaces.find((x) => x && x.ten === ten);
      cungViews.push(phanTichCung(chart, p.chi, kb, matches));
    }
  }
  const cachCuc = matches
    .filter((m) => m.rule.loai === 'cach-cuc' && arr(m.rule.cung).some((c) => ['Mệnh', 'Thân'].includes(c)))
    .map((m) => toView(m, chart))
    .sort((a, b) => b.mucDo - a.mucDo);
  const tuoi = namXem - tb.amLich.nam + 1;
  const daiHan = daiHanList(chart, kb, tuoi);
  return {
    tongQuan: tongQuan(chart, kb),
    cachCuc,
    cung: cungViews,
    daiHan,
    namXem: namXemView(chart, kb, namXem),
    tongKet: tongKetLuan(chart, kb, matches, cungViews, daiHan),
    thongKe: { soLuat: kb.rules.length, soSaoCoGiaiNghia: Object.keys(kb.stars).length, soLuatKhop: matches.length },
  };
}
export type LuanGiai = ReturnType<typeof luanGiai>;
export { namXemView };
