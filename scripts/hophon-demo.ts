import { xemHopHon } from '../src/tuvi/index';
const r = xemHopHon({ ten: 'An', gioiTinh: 'nam', ngay: 31, thang: 8, nam: 1998, gio: 11 }, { ten: 'Bình', gioiTinh: 'nu', ngay: 12, thang: 3, nam: 2000, gio: 5 }, 2026);
const h = r.hopHon;
console.log(h.diem, h.xepLoai, h.tieuDe); h.tomTat.forEach((t) => console.log(' ', t));
for (const l of h.lop) { console.log(`\n## ${l.ten} ${l.diem}`); l.muc.forEach((m) => console.log(` [${m.diem}] ${m.tieuDe}: ${m.noiDung}`)); }
console.log('\n## Vấn đề'); h.vanDe.forEach((v) => console.log(` (${v.nhom}|${v.nguon}) ${v.tieuDe}: ${v.noiDung}`));
console.log('\n## Năm cưới'); h.namCuoi.forEach((n) => console.log(` ${n.nam} ${n.xepHang} N:${n.dauHieuNam} | Nu:${n.dauHieuNu} | ${n.canhBao}`));
console.log(h.duongDoi.giaiDoan);
