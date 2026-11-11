#!/usr/bin/env node
/* Kiểm tra file tri thức Tử Vi theo src/tuvi/kb/SCHEMA.md */
const fs = require('fs');
const path = require('path');

const catalog = require(path.join(__dirname, '../src/tuvi/kb/catalog.json'));
const STAR_IDS = new Set(catalog.stars.map((s) => s.id));
const GROUPS = new Set(Object.keys(catalog.groups));
const CUNG = new Set(['Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ', 'Thân', 'Hạn', '*']);
const CHI = new Set(['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']);
const CAN = new Set(['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý']);
const HANH = new Set(['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ']);
const SCOPES = new Set(['toa', 'xung', 'tamHop', 'chieu', 'tamPhuong', 'nhiHop', 'giap']);
const DAC = new Set(['sang', 'ham', 'binh', 'M', 'V', 'Đ', 'B', 'H']);
const AMDUONG = new Set(['duong-nam', 'am-nam', 'duong-nu', 'am-nu']);
const CHUDE = new Set(['tinh-cach', 'ngoai-hinh', 'su-nghiep', 'tai-loc', 'tinh-duyen', 'suc-khoe', 'tho-yeu', 'gia-dao', 'con-cai', 'phuc-duc', 'nha-cua', 'xuat-hanh', 'quan-he', 'tai-hoa', 'hoc-van']);

const arr = (v) => (Array.isArray(v) ? v : [v]);
function checkStarRef(ref, errs, where) {
  if (typeof ref !== 'string') return errs.push(`${where}: tham chiếu sao không phải chuỗi`);
  if (ref.startsWith('@')) {
    if (!GROUPS.has(ref.slice(1))) errs.push(`${where}: nhóm không tồn tại "${ref}"`);
  } else if (!STAR_IDS.has(ref)) errs.push(`${where}: sao không tồn tại "${ref}"`);
}
function checkSet(vals, set, errs, where, name) {
  for (const v of arr(vals)) if (!set.has(v)) errs.push(`${where}: ${name} không hợp lệ "${v}"`);
}

function checkCond(c, errs, where) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return errs.push(`${where}: Cond phải là object`);
  const keys = Object.keys(c);
  if (!keys.length) return errs.push(`${where}: Cond rỗng`);
  if (c.all || c.any) {
    const list = c.all || c.any;
    if (!Array.isArray(list) || !list.length) errs.push(`${where}: all/any phải là mảng không rỗng`);
    else list.forEach((x, i) => checkCond(x, errs, `${where}.${c.all ? 'all' : 'any'}[${i}]`));
    return;
  }
  if (c.not) return checkCond(c.not, errs, `${where}.not`);
  if (c.sao !== undefined) {
    arr(c.sao).forEach((s) => checkStarRef(s, errs, where));
    if (c.o !== undefined && !SCOPES.has(c.o)) errs.push(`${where}: phạm vi o không hợp lệ "${c.o}"`);
    if (c.dacTinh !== undefined) checkSet(c.dacTinh, DAC, errs, where, 'dacTinh');
    if (c.min !== undefined && !(Number.isInteger(c.min) && c.min >= 1)) errs.push(`${where}: min không hợp lệ`);
    const extra = keys.filter((k) => !['sao', 'o', 'dacTinh', 'min'].includes(k));
    if (extra.length) errs.push(`${where}: khoá thừa ${extra}`);
    return;
  }
  if (c.giap !== undefined) return arr(c.giap).forEach((s) => checkStarRef(s, errs, where));
  if (c.tai !== undefined) {
    if (!CUNG.has(c.tai) || c.tai === '*') errs.push(`${where}: tên cung "${c.tai}" không hợp lệ`);
    return checkCond(c.dieuKien, errs, `${where}.tai(${c.tai})`);
  }
  if (c.chi !== undefined) return checkSet(c.chi, CHI, errs, where, 'chi');
  if (c.vcd !== undefined || c.thanCu !== undefined) return;
  if (c.canNam !== undefined) return checkSet(c.canNam, CAN, errs, where, 'canNam');
  if (c.chiNam !== undefined) return checkSet(c.chiNam, CHI, errs, where, 'chiNam');
  if (c.gioSinh !== undefined) return checkSet(c.gioSinh, CHI, errs, where, 'gioSinh');
  if (c.thangSinh !== undefined) return arr(c.thangSinh).forEach((m) => (m >= 1 && m <= 12) || errs.push(`${where}: thangSinh sai`));
  if (c.gioiTinh !== undefined) return ['nam', 'nu'].includes(c.gioiTinh) || errs.push(`${where}: gioiTinh sai`);
  if (c.amDuong !== undefined) return checkSet(c.amDuong, AMDUONG, errs, where, 'amDuong');
  if (c.menhHanh !== undefined) return checkSet(c.menhHanh, HANH, errs, where, 'menhHanh');
  if (c.cucHanh !== undefined) return checkSet(c.cucHanh, HANH, errs, where, 'cucHanh');
  errs.push(`${where}: không nhận ra Cond ${JSON.stringify(c).slice(0, 80)}`);
}

function validateRules(doc, errs) {
  if (!Array.isArray(doc.rules)) return errs.push('thiếu mảng "rules"');
  const ids = new Set();
  doc.rules.forEach((r, i) => {
    const w = `rules[${i}](${r.id})`;
    if (!r.id || !/^[a-z0-9-]+$/.test(r.id)) errs.push(`${w}: id không hợp lệ`);
    if (ids.has(r.id)) errs.push(`${w}: id trùng`);
    ids.add(r.id);
    if (!r.ten) errs.push(`${w}: thiếu ten`);
    if (!['cach-cuc', 'phu-doan', 'tinh-chat', 'han'].includes(r.loai)) errs.push(`${w}: loai sai`);
    checkSet(r.cung, CUNG, errs, w, 'cung');
    if (r.gioiTinh && !['nam', 'nu'].includes(r.gioiTinh)) errs.push(`${w}: gioiTinh sai`);
    if (!r.ketLuan || r.ketLuan.length < 8) errs.push(`${w}: thiếu ketLuan`);
    if (!['cat', 'hung', 'trung'].includes(r.danhGia)) errs.push(`${w}: danhGia sai`);
    if (![1, 2, 3].includes(r.mucDo)) errs.push(`${w}: mucDo sai`);
    if (r.chuDe) checkSet(r.chuDe, CHUDE, errs, w, 'chuDe');
    if (r.trang !== undefined && typeof r.trang !== 'number') errs.push(`${w}: trang phải là số`);
    checkCond(r.dieuKien, errs, `${w}.dieuKien`);
  });
}

function validateStars(doc, errs) {
  for (const [id, s] of Object.entries(doc)) {
    if (!STAR_IDS.has(id)) errs.push(`stars: id không tồn tại "${id}"`);
    if (!s.tomTat) errs.push(`stars.${id}: thiếu tomTat`);
    if (s.taiCung) for (const k of Object.keys(s.taiCung)) if (!CUNG.has(k)) errs.push(`stars.${id}.taiCung: cung sai "${k}"`);
  }
}

let total = 0;
for (const f of process.argv.slice(2)) {
  const errs = [];
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    console.log(`✗ ${f}: JSON lỗi: ${e.message}`);
    total++;
    continue;
  }
  if (doc.stars && doc.groups) { console.log(`· ${f}: catalog (bỏ qua)`); continue; }
  if (doc.rules) validateRules(doc, errs);
  else validateStars(doc, errs);
  const n = doc.rules ? doc.rules.length : Object.keys(doc).length;
  if (errs.length) {
    console.log(`✗ ${f}: ${errs.length} lỗi (${n} mục)`);
    errs.slice(0, 60).forEach((e) => console.log('   ' + e));
  } else console.log(`✓ ${f}: OK (${n} mục)`);
  total += errs.length;
}
process.exit(total ? 1 : 0);
