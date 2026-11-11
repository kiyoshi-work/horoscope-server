/**
 * Bộ đánh giá luật (DSL mô tả ở kb/SCHEMA.md).
 * Mỗi luật khớp trả về danh sách "hits" (sao nào ở cung nào làm luật khớp) để giao diện tô sáng bộ sao.
 */
import { Chart, StarInChart } from './chart';
import { CAN, CHI, DacTinh, giap, mod, nhiHop, tamHop, tamPhuong, xung } from './core';
import { CATALOG, KB, Rule } from './kb';

export interface Hit {
  chi: number;
  id: string;
}
export interface RuleMatch {
  rule: Rule;
  chi: number; // cung được xét
  hits: Hit[];
  boi: 'goc' | 'dai-han' | 'tieu-han' | 'luu-thai-tue';
}

interface Ctx {
  chart: Chart;
  target: number;
  luu?: Record<number, StarInChart[]>;
  hanChi?: number;
}

const arr = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);
const DAC: Record<string, DacTinh[]> = { sang: ['M', 'V', 'Đ'], ham: ['H'], binh: ['B'] };

function starsAt(ctx: Ctx, chi: number): { id: string; dacTinh: DacTinh | null }[] {
  const p = ctx.chart.palaces[chi];
  const out: { id: string; dacTinh: DacTinh | null }[] = p.stars.map((s) => ({ id: s.id, dacTinh: s.dacTinh }));
  if (p.tuan) out.push({ id: 'tuan', dacTinh: null });
  if (p.triet) out.push({ id: 'triet', dacTinh: null });
  // Khi xét hạn: sao lưu được coi như sao gốc tương ứng (Lưu Thái Tuế ≈ Thái Tuế ...)
  for (const s of ctx.luu?.[chi] || []) {
    out.push({ id: s.id, dacTinh: s.dacTinh });
    if (s.base) out.push({ id: s.base, dacTinh: s.dacTinh });
  }
  return out;
}

function scope(o: string, c: number): number[] {
  switch (o) {
    case 'xung': return [xung(c)];
    case 'tamHop': return tamHop(c);
    case 'chieu': return [xung(c), ...tamHop(c)];
    case 'tamPhuong': return tamPhuong(c);
    case 'nhiHop': return [nhiHop(c)];
    case 'giap': return giap(c);
    default: return [c];
  }
}

function members(ref: string): string[] {
  return ref.startsWith('@') ? CATALOG.groups[ref.slice(1)] || [] : [ref];
}

function findRef(ctx: Ctx, ref: string, chis: number[], dac?: string | string[]): Hit[] {
  const mem = new Set(members(ref));
  const allowed = dac === undefined ? null : new Set(arr(dac).flatMap((d) => DAC[d] || [d]));
  const hits: Hit[] = [];
  for (const chi of chis)
    for (const s of starsAt(ctx, chi))
      if (mem.has(s.id) && (!allowed || (s.dacTinh && allowed.has(s.dacTinh)))) hits.push({ chi, id: s.id });
  return hits;
}

export function palaceByName(chart: Chart, ten: string, hanChi?: number): number {
  if (ten === 'Thân') return chart.thienBan.cungThan;
  if (ten === 'Hạn') return hanChi;
  const p = chart.palaces.find((x) => x && x.ten === ten);
  return p ? p.chi : undefined;
}

export function evalCond(c: any, ctx: Ctx, hits: Hit[]): boolean {
  if (!c || typeof c !== 'object') return false;
  const tb = ctx.chart.thienBan;
  const P = ctx.chart.palaces[ctx.target];
  if (c.all) {
    const local: Hit[] = [];
    for (const x of c.all) if (!evalCond(x, ctx, local)) return false;
    hits.push(...local);
    return true;
  }
  if (c.any) {
    let ok = false;
    for (const x of c.any) {
      const local: Hit[] = [];
      if (evalCond(x, ctx, local)) {
        ok = true;
        hits.push(...local);
      }
    }
    return ok;
  }
  if (c.not) return !evalCond(c.not, ctx, []);
  if (c.sao !== undefined) {
    const refs = arr<string>(c.sao);
    const chis = scope(c.o || 'toa', ctx.target);
    if (refs.length === 1 && refs[0].startsWith('@') && c.min) {
      const h = findRef(ctx, refs[0], chis, c.dacTinh);
      if (new Set(h.map((x) => x.id)).size < c.min) return false;
      hits.push(...h);
      return true;
    }
    const found = refs.map((r) => findRef(ctx, r, chis, c.dacTinh));
    const n = found.filter((h) => h.length).length;
    if (n < (c.min ?? refs.length)) return false;
    found.forEach((h) => hits.push(...h));
    return true;
  }
  if (c.giap !== undefined) {
    const refs = arr<string>(c.giap);
    const [l, r] = giap(ctx.target);
    if (refs.length === 1) {
      const hl = findRef(ctx, refs[0], [l]);
      const hr = findRef(ctx, refs[0], [r]);
      if (!hl.length || !hr.length) return false;
      hits.push(...hl, ...hr);
      return true;
    }
    const [a, b] = refs;
    for (const [x, y] of [[l, r], [r, l]]) {
      const ha = findRef(ctx, a, [x]);
      const hb = findRef(ctx, b, [y]);
      if (ha.length && hb.length) {
        hits.push(...ha, ...hb);
        return true;
      }
    }
    return false;
  }
  if (c.tai !== undefined) {
    const chi = palaceByName(ctx.chart, c.tai, ctx.hanChi);
    if (!chi) return false;
    return evalCond(c.dieuKien, { ...ctx, target: chi }, hits);
  }
  if (c.chi !== undefined) return arr(c.chi).includes(CHI[ctx.target]);
  if (c.vcd !== undefined) return P.vcd === !!c.vcd;
  if (c.thanCu !== undefined) return P.isThan === !!c.thanCu;
  if (c.canNam !== undefined) return arr(c.canNam).includes(CAN[tb.canNam]);
  if (c.chiNam !== undefined) return arr(c.chiNam).includes(CHI[tb.chiNam]);
  if (c.gioSinh !== undefined) return arr(c.gioSinh).includes(CHI[tb.chiGio]);
  if (c.thangSinh !== undefined) return arr(c.thangSinh).includes(tb.amLich.thangTinh);
  if (c.gioiTinh !== undefined) return c.gioiTinh === tb.gioiTinh;
  if (c.amDuong !== undefined) {
    const key = `${tb.amDuongNam === 1 ? 'duong' : 'am'}-${tb.gioiTinh}`;
    return arr(c.amDuong).includes(key);
  }
  if (c.menhHanh !== undefined) return arr(c.menhHanh).includes(tb.menh.hanh);
  if (c.cucHanh !== undefined) return arr(c.cucHanh).includes(tb.cuc.hanh);
  return false;
}

function dedupeHits(h: Hit[]): Hit[] {
  const seen = new Set<string>();
  return h.filter((x) => {
    const k = `${x.chi}:${x.id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Áp toàn bộ luật lá số gốc (không phải luật hạn). */
export function apLuatGoc(chart: Chart, kb: KB): RuleMatch[] {
  const out: RuleMatch[] = [];
  const tb = chart.thienBan;
  for (const rule of kb.rules) {
    if (rule.loai === 'han') continue;
    if (rule.gioiTinh && rule.gioiTinh !== tb.gioiTinh) continue;
    const cung = arr(rule.cung);
    if (cung.includes('Hạn')) continue;
    const targets = new Set<number>();
    for (const ten of cung) {
      if (ten === '*') for (let i = 1; i <= 12; i++) targets.add(i);
      else {
        const chi = palaceByName(chart, ten);
        if (chi) targets.add(chi);
      }
    }
    for (const chi of targets) {
      const hits: Hit[] = [];
      try {
        if (evalCond(rule.dieuKien, { chart, target: chi }, hits)) out.push({ rule, chi, hits: dedupeHits(hits), boi: 'goc' });
      } catch {
        /* luật lỗi: bỏ qua */
      }
    }
  }
  return out;
}

/** Áp luật hạn cho cung đại hạn và tiểu hạn (có sao lưu niên). */
export function apLuatHan(chart: Chart, kb: KB, luu: Record<number, StarInChart[]>, daiHanChi: number | null, tieuHanChi: number, luuThaiTueChi?: number): RuleMatch[] {
  const out: RuleMatch[] = [];
  const tb = chart.thienBan;
  const targets: [number, RuleMatch['boi']][] = [];
  if (daiHanChi) targets.push([daiHanChi, 'dai-han']);
  targets.push([tieuHanChi, 'tieu-han']);
  if (luuThaiTueChi) targets.push([luuThaiTueChi, 'luu-thai-tue']);
  for (const rule of kb.rules) {
    const cung = arr(rule.cung);
    if (rule.loai !== 'han' && !cung.includes('Hạn')) continue;
    if (rule.gioiTinh && rule.gioiTinh !== tb.gioiTinh) continue;
    for (const [chi, boi] of targets) {
      // Luật "xem tiểu hạn theo Thái Tuế lưu niên" chỉ xét tại cung Lưu Thái Tuế, và ngược lại
      if ((rule.xet === 'luu-thai-tue') !== (boi === 'luu-thai-tue')) continue;
      const hits: Hit[] = [];
      try {
        // Đại hạn xét sao gốc; tiểu hạn xét thêm sao lưu niên
        const ctx: Ctx = { chart, target: chi, hanChi: chi, luu: boi === 'dai-han' ? undefined : luu };
        if (evalCond(rule.dieuKien, ctx, hits)) out.push({ rule, chi, hits: dedupeHits(hits), boi });
      } catch {
        /* bỏ qua */
      }
    }
  }
  return out;
}

export const _test = { scope, members, mod };
