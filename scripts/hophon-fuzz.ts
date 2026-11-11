/** Chạy đối chiếu hợp hôn trên nhiều cặp ngẫu nhiên: kiểm tra không lỗi và xem phân bố điểm. */
import { xemHopHon } from '../src/tuvi/index';
const N = Number(process.argv[2] || 300);
let seed = 7;
const rnd = (a: number, b: number) => { seed = (seed * 1103515245 + 12345) % 2147483648; return a + (seed % (b - a + 1)); };
const diem: number[] = [], lop: Record<string, number[]> = {}, nam: Record<string, number> = {};
let loi = 0;
for (let i = 0; i < N; i++) {
  const p = (gt: 'nam' | 'nu') => ({ gioiTinh: gt, ngay: rnd(1, 28), thang: rnd(1, 12), nam: rnd(1950, 2005), gio: rnd(1, 12) });
  try {
    const h = xemHopHon(p('nam'), p('nu'), 2026).hopHon;
    const s = JSON.stringify(h);
    if (/undefined|NaN/.test(s)) throw new Error('undefined/NaN: ' + s.match(/.{60}(undefined|NaN).{20}/)?.[0]);
    diem.push(h.diem);
    h.lop.forEach((l) => (lop[l.ten] ||= []).push(l.diem));
    h.namCuoi.forEach((n) => (nam[n.xepHang] = (nam[n.xepHang] || 0) + 1));
  } catch (e) { loi++; if (loi < 5) console.error(e.message); }
}
const st = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return `min ${s[0]} p10 ${s[Math.floor(s.length * 0.1)]} med ${s[Math.floor(s.length / 2)]} p90 ${s[Math.floor(s.length * 0.9)]} max ${s[s.length - 1]}`; };
console.log(`lỗi: ${loi}/${N}`);
console.log('tổng   ', st(diem));
for (const k in lop) console.log(k.padEnd(22), st(lop[k]));
console.log('xếp hạng năm cưới', nam);
