import { ChartInput, lapLaSo } from './chart';
import { luanGiai } from './analysis';
import { CATALOG, loadKB } from './kb';

export * from './chart';
export * from './analysis';

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
