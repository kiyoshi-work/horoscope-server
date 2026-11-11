import * as fs from 'fs';
import * as path from 'path';

export interface StarDef {
  id: string;
  ten: string;
  hanh: 'K' | 'M' | 'T' | 'H' | 'O';
  loai: string;
  nhom: 'cat' | 'hung' | 'trung';
  tags: string[];
  dau?: 'nam' | 'bac' | 'trung';
  base?: string;
}

export interface StarInfo {
  tomTat?: string;
  tinhChat?: string;
  tuongTrung?: string;
  ngoaiHinh?: string;
  tinhCach?: string;
  boPhan?: string;
  khiSang?: string;
  khiHam?: string;
  mieuDia?: string;
  hamDia?: string;
  taiCung?: Record<string, string>;
  trang?: number[];
}

export interface Rule {
  id: string;
  ten: string;
  loai: 'cach-cuc' | 'phu-doan' | 'tinh-chat' | 'han';
  cung: string[] | string;
  gioiTinh?: 'nam' | 'nu';
  dieuKien: any;
  ketLuan: string;
  danhGia: 'cat' | 'hung' | 'trung';
  mucDo: 1 | 2 | 3;
  chuDe?: string[];
  trang?: number;
  nguyenVan?: string;
  /** 'luu-thai-tue': luật chỉ xét tại cung Lưu Thái Tuế của năm xem */
  xet?: 'luu-thai-tue';
}

/**
 * Thư mục tri thức: ưu tiên TUVI_KB_DIR, rồi src/tuvi/kb (khi chạy dev từ dist — sửa JSON có hiệu lực ngay,
 * không phụ thuộc việc copy asset), cuối cùng là thư mục của file đã build.
 */
const DIR = [process.env.TUVI_KB_DIR, path.resolve(__dirname, '../../../src/tuvi/kb'), __dirname].find(
  (d) => d && fs.existsSync(path.join(d, 'catalog.json')),
);
function readJson<T>(file: string, fallback: T): T {
  const p = path.join(DIR, file);
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`[tuvi/kb] Không đọc được ${file}: ${e.message}`);
    return fallback;
  }
}

const catalogRaw = readJson<{ stars: StarDef[]; groups: Record<string, string[]> }>('catalog.json', { stars: [], groups: {} });
export const CATALOG = {
  stars: catalogRaw.stars,
  groups: catalogRaw.groups,
  byId: Object.fromEntries(catalogRaw.stars.map((s) => [s.id, s])) as Record<string, StarDef>,
};

/** Nạp (lại) toàn bộ tri thức — đọc mỗi lần gọi để file KB mới được dùng ngay khi dev. */
export function loadKB() {
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR) : [];
  const stars: Record<string, StarInfo> = {};
  for (const f of files.filter((f) => /^stars-.*\.json$/.test(f)).sort()) Object.assign(stars, readJson(f, {}));
  const rules: Rule[] = [];
  const seen = new Set<string>();
  for (const f of files.filter((f) => /^rules-.*\.json$/.test(f)).sort()) {
    for (const r of readJson<{ rules: Rule[] }>(f, { rules: [] }).rules || []) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      rules.push(r);
    }
  }
  return { stars, rules };
}
export type KB = ReturnType<typeof loadKB>;
