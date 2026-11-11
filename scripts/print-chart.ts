import { lapLaSo } from '../src/tuvi/chart';
const [ngay, thang, nam, gio, gt] = process.argv.slice(2);
const c = lapLaSo({ ngay: +ngay, thang: +thang, nam: +nam, gio: +gio, gioiTinh: gt === 'nu' ? 'nu' : 'nam' });
const { palaces, ...rest } = c;
console.log(JSON.stringify(rest.thienBan, null, 1));
for (const p of palaces.slice(1))
  console.log(`${p.chiTen.padEnd(4)} ${p.canTen.padEnd(5)} ${p.ten.padEnd(10)} ĐH${String(p.daiHan).padStart(3)} TH:${p.tieuHan} ${p.isThan ? '[THÂN]' : ''}${p.tuan ? '[Tuần]' : ''}${p.triet ? '[Triệt]' : ''}\n     ` +
    p.stars.map((s) => s.ten + (s.dacTinh ? `(${s.dacTinh})` : '')).join(', '));
