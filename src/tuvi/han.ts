/**
 * Vận hạn theo "Tử Vi Chính Biện":
 *  - Đại hạn 10 năm (Dương nam Âm nữ thuận), Tiểu hạn (nam thuận nữ nghịch), Đồng hạn 1-12 tuổi.
 *  - Lưu niên: Lưu Tuần – Triệt theo năm xem; Cửu phi tinh: Thái Tuế, Tang Môn, Bạch Hổ, Khốc, Hư,
 *    Thiên Mã, Lộc Tồn, Kình Dương, Đà La lưu theo năm tiểu hạn (năm xem).
 *  - Lưu nguyệt: lấy cung năm tiểu hạn làm tháng Giêng, nghịch đến tháng sinh, gọi Tý thuận đến giờ sinh.
 *  - Lưu nhật: cung tháng là mồng 1, mỗi cung một ngày, đếm thuận.
 */
import { CAN, CHI, canIdx, dich, mod } from './core';
import { Chart, LOC_TON, StarInChart, thienMaCua, trietCua } from './chart';
import { CATALOG } from './kb';

export interface LuuNien {
  namXem: number;
  canChi: string;
  canNam: number;
  chiNam: number;
  tuoi: number; // tuổi mụ
  daiHan: { chi: number; ten: string; tuTuoi: number; denTuoi: number } | null;
  dongHan: { chi: number; ten: string } | null;
  tieuHan: { chi: number; ten: string };
  /** Sao lưu theo cung (chi) */
  luuSao: Record<number, StarInChart[]>;
  luuTuan: number[];
  luuTriet: number[];
  /** Cung của từng tháng âm lịch 1..12 trong năm xem */
  luuNguyet: { thang: number; chi: number; ten: string }[];
  /** Đại hạn: Nam/Bắc đẩu ứng mạnh nửa đầu/nửa sau */
  ghiChu: string[];
}

function star(id: string, chi: number): StarInChart {
  const d = CATALOG.byId[id];
  return { id: d.id, ten: d.ten, hanh: null, loai: d.loai, nhom: d.nhom, dacTinh: null, base: d.base };
}

export function tinhLuuNien(chart: Chart, namXem: number): LuuNien {
  const tb = chart.thienBan;
  const canNam = canIdx(namXem + 7);
  const chiNam = mod(namXem + 8, 12) + 1;
  const tuoi = namXem - tb.amLich.nam + 1;
  const P = chart.palaces;

  let daiHan: LuuNien['daiHan'] = null;
  for (const p of P.slice(1)) if (tuoi >= p.daiHan && tuoi <= p.daiHan + 9) daiHan = { chi: p.chi, ten: p.ten, tuTuoi: p.daiHan, denTuoi: p.daiHan + 9 };
  const dh = P.slice(1).find((p) => p.dongHan === tuoi);
  const dongHan = dh ? { chi: dh.chi, ten: dh.ten } : null;
  const th = P.slice(1).find((p) => p.tieuHan === chiNam);

  const luuSao: Record<number, StarInChart[]> = {};
  const add = (chi: number, id: string) => (luuSao[chi] ||= []).push(star(id, chi));
  add(chiNam, 'luu-thai-tue');
  add(dich(chiNam, 2), 'luu-tang-mon');
  add(dich(chiNam, 8), 'luu-bach-ho');
  add(dich(7, -(chiNam - 1)), 'luu-thien-khoc');
  add(dich(7, chiNam - 1), 'luu-thien-hu');
  add(thienMaCua(chiNam), 'luu-thien-ma');
  const loc = LOC_TON[canNam];
  add(loc, 'luu-loc-ton');
  add(dich(loc, 1), 'luu-kinh-duong');
  add(dich(loc, -1), 'luu-da-la');

  const tuanCuoi = dich(chiNam, 10 - canNam);
  const luuTuan = [dich(tuanCuoi, 1), dich(tuanCuoi, 2)];
  const luuTriet = [...trietCua(canNam)];
  luuTuan.forEach((c) => add(c, 'luu-tuan'));
  luuTriet.forEach((c) => add(c, 'luu-triet'));

  const gieng = dich(chiNam, -(tb.amLich.thangTinh - 1), tb.chiGio - 1);
  const luuNguyet = Array.from({ length: 12 }, (_, i) => {
    const chi = dich(gieng, i);
    return { thang: i + 1, chi, ten: P[chi].ten };
  });

  const ghiChu: string[] = [];
  if (daiHan) {
    const chinh = P[daiHan.chi].stars.filter((s) => s.loai === 'chinh');
    const nam = chinh.filter((s) => CATALOG.byId[s.id].dau === 'nam').map((s) => s.ten);
    const bac = chinh.filter((s) => CATALOG.byId[s.id].dau === 'bac').map((s) => s.ten);
    if (bac.length) ghiChu.push(`Bắc đẩu tinh (${bac.join(', ')}) ở đại hạn ứng tốt xấu mạnh trong 5 năm đầu (${daiHan.tuTuoi}–${daiHan.tuTuoi + 4} tuổi). (tr.137)`);
    if (nam.length) ghiChu.push(`Nam đẩu tinh (${nam.join(', ')}) ở đại hạn ứng tốt xấu mạnh trong 5 năm sau (${daiHan.tuTuoi + 5}–${daiHan.denTuoi} tuổi). (tr.137)`);
    const hop = tb.thuanNghich === 1 ? nam : bac;
    if (hop.length) ghiChu.push(`${tb.amDuongTen} gặp ${tb.thuanNghich === 1 ? 'Nam' : 'Bắc'} đẩu tinh ở hạn là hợp, tốt. (tr.137)`);
  }

  return {
    namXem,
    canChi: `${CAN[canNam]} ${CHI[chiNam]}`,
    canNam,
    chiNam,
    tuoi,
    daiHan,
    dongHan,
    tieuHan: { chi: th.chi, ten: th.ten },
    luuSao,
    luuTuan,
    luuTriet,
    luuNguyet,
    ghiChu,
  };
}
