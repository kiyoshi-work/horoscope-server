/* Đo tần suất khớp của từng luật trên N lá số ngẫu nhiên. */
import { lapLaSo } from '../src/tuvi/chart';
import { loadKB } from '../src/tuvi/kb';
import { apLuatGoc, apLuatHan } from '../src/tuvi/rules';
import { tinhLuuNien } from '../src/tuvi/han';

const N = +(process.argv[2] || 300);
const kb = loadKB();
const count: Record<string, number> = {};
let seed = 42;
const rnd = (n: number) => ((seed = (seed * 1103515245 + 12345) % 2147483648), Math.floor(seed / 65536) % n);
for (let i = 0; i < N; i++) {
  const c = lapLaSo({ lich: 'am', ngay: 1 + rnd(29), thang: 1 + rnd(12), nam: 1940 + rnd(70), gio: 1 + rnd(12), gioiTinh: rnd(2) ? 'nam' : 'nu' });
  const seen = new Set<string>();
  for (const m of apLuatGoc(c, kb)) seen.add(m.rule.id);
  const l = tinhLuuNien(c, 2026);
  for (const m of apLuatHan(c, kb, l.luuSao, l.daiHan?.chi ?? null, l.tieuHan.chi)) seen.add(m.rule.id);
  seen.forEach((id) => (count[id] = (count[id] || 0) + 1));
}
const byFile: Record<string, { total: number; never: string[]; often: string[] }> = {};
for (const r of kb.rules) {
  const f = r.id.split('-')[0];
  const b = (byFile[f] ||= { total: 0, never: [], often: [] });
  b.total++;
  const k = count[r.id] || 0;
  if (!k) b.never.push(r.id);
  if (k / N > 0.5) b.often.push(`${r.id} (${Math.round((100 * k) / N)}%)`);
}
for (const [f, b] of Object.entries(byFile))
  console.log(`[${f}] ${b.total} luật · không khớp lần nào: ${b.never.length} · khớp >50%: ${b.often.length}${b.often.length ? '\n   ' + b.often.join(', ') : ''}`);
const avg = Object.values(count).reduce((a, b) => a + b, 0) / N;
console.log(`Trung bình ${avg.toFixed(1)} luật khớp / lá số`);
