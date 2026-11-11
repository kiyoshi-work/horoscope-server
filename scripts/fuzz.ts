import { xemTuVi } from '../src/tuvi';
let err = 0, n = 0; const t0 = Date.now();
const seen: Record<string, number> = {};
for (let y = 1900; y <= 2099; y += 1) for (const m of [1, 2, 5, 9, 12]) for (const d of [1, 15, 29, 31]) {
  const gio = ((y + m + d) % 12) + 1; const gioiTinh = (y + d) % 2 ? 'nam' : 'nu';
  for (const lich of ['duong', 'am'] as const) {
    n++;
    try {
      const r: any = xemTuVi({ ngay: d, thang: m, nam: y, gio, gioiTinh, lich } as any, 2026);
      const a = r.analysis;
      if (!a.tongQuan || !a.cung?.length || !a.namXem || !a.tongKet) throw new Error('thiếu mục');
      for (const p of r.chart.palaces.slice(1)) if (!p || !p.ten) throw new Error('cung rỗng');
      const s = JSON.stringify(r); if (/undefined|NaN/.test(s)) seen['undefined/NaN in json'] = (seen['undefined/NaN in json'] || 0) + 1;
    } catch (e) { const k = String(e.message).slice(0, 100); if (!seen[k]) console.log(y, m, d, lich, k); seen[k] = (seen[k] || 0) + 1; err++; }
  }
}
console.log({ n, err, ms: Date.now() - t0, seen });
