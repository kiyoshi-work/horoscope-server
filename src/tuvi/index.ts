import { ChartInput, lapLaSo } from './chart';
import { luanGiai } from './analysis';
import { CATALOG, loadKB } from './kb';
import { xemHopHonTuLaSo } from './hophon';

export * from './chart';
export * from './analysis';
export * from './hophon';

/** Lập lá số + toàn bộ luận giải. */
export function xemTuVi(input: ChartInput, namXem: number) {
  const kb = loadKB();
  const chart = lapLaSo(input);
  const analysis = luanGiai(chart, kb, namXem);
  const ids = new Set(chart.palaces.slice(1).flatMap((p) => p.stars.map((s) => s.id)));
  ['tuan', 'triet'].forEach((x) => ids.add(x));
  const sao = Object.fromEntries(
    [...ids].map((id) => [id, { ...CATALOG.byId[id], ...(kb.stars[id] || {}) }]),
  );
  return { chart, analysis, sao };
}

/** Lập hai lá số và đối chiếu hợp hôn. */
export function xemHopHon(nam: ChartInput, nu: ChartInput, namXem: number) {
  const kb = loadKB();
  const lap = (input: ChartInput) => {
    const chart = lapLaSo(input);
    const lg = luanGiai(chart, kb, namXem);
    const ids = new Set(chart.palaces.slice(1).flatMap((p) => p.stars.map((s) => s.id)));
    const sao = Object.fromEntries([...ids].map((id) => [id, { ...CATALOG.byId[id], ...(kb.stars[id] || {}) }]));
    return { chart, lg, sao };
  };
  const A = lap(nam), B = lap(nu);
  const hopHon = xemHopHonTuLaSo(A, B, namXem);
  const gon = (x: typeof A) => ({ chart: x.chart, sao: x.sao, luu: x.lg.namXem.luu, chuDe: x.lg.tongKet.chuDe.map((c) => ({ key: c.key, tieuDe: c.tieuDe, diem: c.diem })) });
  return { nam: gon(A), nu: gon(B), hopHon };
}
