/* Tử Vi Chính Biện — giao diện lá số & luận giải (vanilla JS) */
(() => {
  const CHI = ['', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const CHI_GIO = ['', '23h–1h', '1h–3h', '3h–5h', '5h–7h', '7h–9h', '9h–11h', '11h–13h', '13h–15h', '15h–17h', '17h–19h', '19h–21h', '21h–23h'];
  // vị trí ô trên lưới 4x4 theo chi
  const POS = { 6: [1, 1], 7: [1, 2], 8: [1, 3], 9: [1, 4], 10: [2, 4], 11: [3, 4], 12: [4, 4], 1: [4, 3], 2: [4, 2], 3: [4, 1], 4: [3, 1], 5: [2, 1] };
  const TEN_DAC = { M: 'Miếu', V: 'Vượng', Đ: 'Đắc địa', B: 'Bình hòa', H: 'Hãm địa' };
  const DG = { cat: 'Cát', hung: 'Hung', trung: 'Trung tính' };
  const CHU_DE = { 'tinh-cach': 'Tính cách', 'ngoai-hinh': 'Hình dáng', 'su-nghiep': 'Sự nghiệp', 'tai-loc': 'Tài lộc', 'tinh-duyen': 'Tình duyên', 'suc-khoe': 'Sức khỏe', 'tho-yeu': 'Thọ yểu', 'gia-dao': 'Gia đạo', 'con-cai': 'Con cái', 'phuc-duc': 'Phúc đức', 'nha-cua': 'Nhà cửa', 'xuat-hanh': 'Xuất hành', 'quan-he': 'Quan hệ', 'tai-hoa': 'Tai họa', 'hoc-van': 'Học vấn' };
  const MAJOR_TAGS = ['luc-cat', 'luc-sat', 'tam-hoa', 'loc', 'ma', 'khong-kiep', 'kinh-da'];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const tamHop = (c) => [((c + 3) % 12) + 1, ((c + 7) % 12) + 1];
  const xung = (c) => ((c + 5) % 12) + 1;

  const state = { data: null, tab: 'tongquan', sel: null, hits: [], hitCung: [], activeKey: null, chuDeFilter: null, dgFilter: null };

  // ───────────────────────── Form
  const form = $('#form');
  const gioSel = $('#gio');
  for (let i = 1; i <= 12; i++) gioSel.add(new Option(`${CHI[i]} (${CHI_GIO[i]})`, i));
  function loadForm() {
    const q = new URLSearchParams(location.search);
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('tuvi-form') || '{}'); } catch { /* bỏ qua */ }
    const v = (k, d) => q.get(k) ?? saved[k] ?? d;
    form.ten.value = v('ten', '');
    form.gioiTinh.value = v('gioiTinh', 'nam');
    form.lich.value = v('lich', 'duong');
    form.ngay.value = v('ngay', '');
    form.thang.value = v('thang', '');
    form.nam.value = v('nam', '');
    form.gio.value = v('gio', '1');
    form.thangNhuan.checked = v('thangNhuan', '0') === '1';
    form.namXem.value = v('namXem', new Date().getFullYear());
    if (q.get('tab')) state.tab = q.get('tab');
    if (q.get('cung')) state.sel = +q.get('cung');
    return !!form.ngay.value && !!form.nam.value;
  }
  function params() {
    return {
      ten: form.ten.value.trim(), gioiTinh: form.gioiTinh.value, lich: form.lich.value,
      ngay: form.ngay.value, thang: form.thang.value, nam: form.nam.value, gio: form.gio.value,
      thangNhuan: form.thangNhuan.checked ? '1' : '0', namXem: form.namXem.value || new Date().getFullYear(),
    };
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); fetchChart(); });

  async function fetchChart() {
    const p = params();
    try { localStorage.setItem('tuvi-form', JSON.stringify(p)); } catch { /* bỏ qua */ }
    history.replaceState(null, '', '?' + new URLSearchParams(p));
    document.body.classList.add('loading');
    try {
      const res = await fetch('/api/tuvi/laso?' + new URLSearchParams(p));
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Lỗi máy chủ');
      state.data = json;
      render();
    } catch (err) {
      $('#content').innerHTML = `<div class="err">Không lập được lá số: ${esc(err.message)}</div>`;
    } finally {
      document.body.classList.remove('loading');
    }
  }

  // ───────────────────────── Chart
  function starHtml(s, extraCls = '') {
    const cls = ['star', `hanh-${s.hanh || ''}`, s.dacTinh === 'H' ? 'ham' : '', extraCls, isHit(s.chi, s.id) ? 'hl' : ''].join(' ');
    return `<span class="${cls}" data-star="${esc(s.id)}" data-chi="${s.chi}" title="${esc(tip(s))}">${esc(s.ten)}${s.dacTinh ? `<sup>${s.dacTinh}</sup>` : ''}</span>`;
  }
  function tip(s) {
    const info = state.data.sao[s.base || s.id] || {};
    return `${s.ten}${s.dacTinh ? ' – ' + TEN_DAC[s.dacTinh] : ''}${info.tomTat ? ': ' + info.tomTat : ''}`;
  }
  function isHit(chi, id) { return state.hits.some((h) => h.chi === chi && h.id === id); }

  function renderChart() {
    const { chart, analysis } = state.data;
    const tb = chart.thienBan;
    const P = chart.palaces;
    const luu = analysis.namXem.luu;
    const showLuu = $('#showLuu').checked;
    const tp = state.sel ? new Set([state.sel, xung(state.sel), ...tamHop(state.sel)]) : new Set();
    const hitCung = new Set([...state.hits.map((h) => h.chi), ...state.hitCung]);
    let html = '';
    for (let chi = 1; chi <= 12; chi++) {
      const p = P[chi];
      const stars = p.stars.map((s) => ({ ...s, chi }));
      const chinh = stars.filter((s) => s.loai === 'chinh');
      const ts = stars.find((s) => s.loai === 'vong-trang-sinh');
      const others = stars.filter((s) => s.loai !== 'chinh' && s.loai !== 'vong-trang-sinh');
      const def = (s) => state.data.sao[s.id] || {};
      const major = (s) => (def(s).tags || []).some((t) => MAJOR_TAGS.includes(t)) || s.id === 'hoa-ky';
      const good = others.filter((s) => s.nhom !== 'hung').sort((a, b) => major(b) - major(a));
      const bad = others.filter((s) => s.nhom === 'hung').sort((a, b) => major(b) - major(a));
      const badges = [p.isThan ? '<span class="badge">Thân</span>' : '', p.tuan ? '<span class="badge tuan">Tuần</span>' : '', p.triet ? '<span class="badge triet">Triệt</span>' : '',
        luu.daiHan && luu.daiHan.chi === chi ? '<span class="badge han">ĐH</span>' : '', luu.tieuHan.chi === chi ? '<span class="badge han">TH</span>' : ''].join('');
      const luuStars = showLuu ? (luu.luuSao[chi] || []).map((s) => ({ ...s, chi })) : [];
      const cls = ['cell', state.sel === chi ? 'sel' : '', tp.has(chi) && state.sel !== chi ? 'tp' : '', hitCung.has(chi) ? 'hl' : ''].join(' ');
      html += `<div class="${cls}" data-cell="${chi}" style="grid-row:${POS[chi][0]};grid-column:${POS[chi][1]}">
        <div class="cell-head"><span class="cc">${esc(p.canTen)} ${esc(p.chiTen)}</span><span class="name">${esc(p.ten)}${badges}</span><span class="dh" title="Đại hạn ${p.daiHan}–${p.daiHan + 9} tuổi">${p.daiHan}</span></div>
        <div class="chinh">${chinh.length ? chinh.map((s) => starHtml(s)).join('') : '<span class="meta">(vô chính diệu)</span>'}</div>
        <div class="phu"><div class="col">${good.map((s) => starHtml(s, major(s) ? 'major' : '')).join('')}</div><div class="col r">${bad.map((s) => starHtml(s, major(s) ? 'major' : '')).join('')}</div></div>
        ${luuStars.length ? `<div class="luu">${luuStars.map((s) => starHtml(s)).join('')}</div>` : ''}
        <div class="cell-foot"><span title="Tiểu hạn rơi vào cung này ở các năm ${CHI[p.tieuHan]}">TH ${CHI[p.tieuHan]}</span><span class="ts">${ts ? starHtml(ts) : ''}</span></div>
      </div>`;
    }
    html += `<div class="center">
      <h2>${esc(tb.ten)}</h2>
      <div class="row"><span>Dương lịch</span><b>${tb.duongLich.ngay}/${tb.duongLich.thang}/${tb.duongLich.nam} · giờ ${CHI[tb.chiGio]} (${esc(tb.gioKhoang)})</b></div>
      <div class="row"><span>Âm lịch</span><b>${tb.amLich.ngay}/${tb.amLich.thang}${tb.amLich.nhuan ? ' (nhuận)' : ''}/${tb.amLich.nam}</b></div>
      <div class="row"><span>Can chi</span><b>Năm ${esc(tb.canChi.nam)} · tháng ${esc(tb.canChi.thang)} · ngày ${esc(tb.canChi.ngay)} · giờ ${esc(tb.canChi.gio)}</b></div>
      <div class="row"><span>Âm dương</span><b>${esc(tb.amDuongTen)} · ${esc(tb.amDuongLy.text)}</b></div>
      <div class="row"><span>Bản mệnh</span><b class="hanh-${tb.menh.hanh}">${esc(tb.menh.napAm)}</b></div>
      <div class="row"><span>Cục</span><b class="hanh-${tb.cuc.hanh}">${esc(tb.cuc.ten)}</b></div>
      <div class="row"><span>Mệnh chủ</span><b>${esc(tb.menhChu)} · Thân chủ: ${esc(tb.thanChu)}</b></div>
      <div class="row"><span>Thân cư</span><b>${esc(tb.thanCu)}</b></div>
      <div class="row"><span>Năm xem</span><b>${luu.namXem} (${esc(luu.canChi)}) · ${luu.tuoi} tuổi</b></div>
    </div><svg id="lines"></svg>`;
    const el = $('#chart');
    el.innerHTML = html;
    el.classList.toggle('focusing', !!state.sel || state.hits.length > 0 || state.hitCung.length > 0);
    requestAnimationFrame(drawLines);
  }

  function anchor(chi) {
    const box = $('#chart').getBoundingClientRect();
    const r = $(`[data-cell="${chi}"]`).getBoundingClientRect();
    const cx = box.width / 2, cy = box.height / 2;
    const x0 = r.left - box.left, y0 = r.top - box.top;
    return [Math.min(Math.max(cx, x0), x0 + r.width), Math.min(Math.max(cy, y0), y0 + r.height)];
  }
  function drawLines() {
    const svg = $('#lines');
    if (!svg) return;
    const box = $('#chart').getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const seg = (a, b, cls) => { const [x1, y1] = anchor(a), [x2, y2] = anchor(b); return `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; };
    let s = '';
    if (state.sel) {
      const [a, b] = tamHop(state.sel);
      s += seg(state.sel, a, '') + seg(a, b, '') + seg(b, state.sel, '') + seg(state.sel, xung(state.sel), 'xung');
    }
    const hc = [...new Set([...state.hits.map((h) => h.chi), ...state.hitCung])];
    if (hc.length > 1) for (let i = 1; i < hc.length; i++) s += seg(hc[0], hc[i], 'hit');
    svg.innerHTML = s;
  }
  window.addEventListener('resize', () => state.data && drawLines());
  $('#showLuu').addEventListener('change', () => state.data && renderChart());

  $('#chart').addEventListener('click', (e) => {
    const st = e.target.closest('[data-star]');
    if (st) {
      e.stopPropagation();
      showStar(st.dataset.star, +st.dataset.chi);
      return;
    }
    const cell = e.target.closest('[data-cell]');
    if (cell) selectPalace(+cell.dataset.cell, true);
  });

  function selectPalace(chi, openTab) {
    state.sel = state.sel === chi && !openTab ? null : chi;
    state.hits = [];
    state.hitCung = [];
    state.activeKey = null;
    if (openTab && state.tab !== 'cung' && state.tab !== 'van') state.tab = 'cung';
    hideFocus();
    render();
    if (openTab && state.tab === 'cung') {
      const d = document.querySelector(`details[data-chi="${chi}"]`);
      if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  }

  function highlight(key, hits, cung) {
    if (state.activeKey === key) { state.activeKey = null; state.hits = []; state.hitCung = []; }
    else { state.activeKey = key; state.hits = hits || []; state.hitCung = cung || []; state.sel = null; }
    renderChart();
    document.querySelectorAll('[data-key]').forEach((el) => el.classList.toggle('active', el.dataset.key === state.activeKey));
  }

  // ───────────────────────── Focus: sao
  function showStar(id, chi) {
    const d = state.data;
    const info = d.sao[id] || {};
    const p = d.chart.palaces[chi];
    const s = p ? p.stars.find((x) => x.id === id) : null;
    const cungTen = p ? p.ten : '';
    const fields = [['tinhChat', 'Bản chất'], ['tuongTrung', 'Tượng trưng'], ['ngoaiHinh', 'Hình dáng'], ['tinhCach', 'Tính cách'], ['boPhan', 'Bộ phận cơ thể / bệnh'], ['khiSang', 'Khi miếu vượng'], ['khiHam', 'Khi hãm'], ['mieuDia', 'Miếu/đắc địa'], ['hamDia', 'Hãm địa']];
    const tc = info.taiCung || {};
    const NHOM = { cat: 'Cát tinh', hung: 'Hung tinh', trung: 'Trung tính' };
    const LOAI = { chinh: 'Chính tinh', phu: 'Trung/phụ tinh', 'vong-thai-tue': 'Vòng Thái Tuế', 'vong-bac-si': 'Vòng Bác Sĩ', 'vong-trang-sinh': 'Vòng Tràng Sinh', luu: 'Sao lưu niên', 'tuan-triet': 'Tuần/Triệt' };
    const HANH = { K: 'Kim', M: 'Mộc', T: 'Thủy', H: 'Hỏa', O: 'Thổ' };
    // bộ sao liên quan: luật đã khớp có chứa sao này tại cung này
    const rel = allMatches().filter((m) => m.hits.some((h) => h.id === id && h.chi === chi));
    const html = `<button class="close" aria-label="Đóng">×</button>
      <h3>${esc(info.ten || (s && s.ten) || id)}${s && s.dacTinh ? ` <span class="meta">(${TEN_DAC[s.dacTinh]})</span>` : ''}</h3>
      <div class="tags">${info.hanh ? `<span class="tag">Hành ${HANH[info.hanh] || info.hanh}</span>` : ''}${info.loai ? `<span class="tag">${LOAI[info.loai] || info.loai}</span>` : ''}${info.nhom ? `<span class="tag">${NHOM[info.nhom]}</span>` : ''}${info.dau ? `<span class="tag">${info.dau === 'nam' ? 'Nam đẩu' : info.dau === 'bac' ? 'Bắc đẩu' : 'Trung thiên'}</span>` : ''}${p ? `<span class="tag">tại ${esc(p.ten)} (${esc(p.chiTen)})</span>` : ''}</div>
      ${info.tomTat ? `<p><b>${esc(info.tomTat)}</b></p>` : '<p class="meta">Chưa có giải nghĩa chi tiết cho sao này trong cơ sở tri thức.</p>'}
      ${tc[cungTen] ? `<p class="here"><b>Tại cung ${esc(cungTen)}:</b> ${esc(tc[cungTen])}</p>` : ''}
      ${fields.filter(([k]) => info[k]).map(([k, t]) => `<p><b>${t}:</b> ${esc(info[k])}</p>`).join('')}
      ${Object.keys(tc).filter((k) => k !== cungTen).length ? `<details><summary class="meta">Ý nghĩa ở các cung khác</summary>${Object.entries(tc).filter(([k]) => k !== cungTen).map(([k, v]) => `<p><b>${esc(k)}:</b> ${esc(v)}</p>`).join('')}</details>` : ''}
      ${rel.length ? `<div class="sub">Bộ sao / cách cục có sao này</div>${rel.map((m) => ruleCard(m)).join('')}` : ''}
      ${info.trang ? `<p class="meta">Sách tr. ${[].concat(info.trang).join(', ')}</p>` : ''}`;
    const f = $('#focus');
    f.innerHTML = html;
    f.classList.remove('hidden');
    state.hits = [{ chi, id }];
    state.hitCung = [];
    state.activeKey = null;
    renderChart();
    f.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function hideFocus() { $('#focus').classList.add('hidden'); }
  $('#focus').addEventListener('click', (e) => {
    if (e.target.closest('.close')) { hideFocus(); state.hits = []; renderChart(); return; }
    onContentClick(e);
  });

  // ───────────────────────── Panel renderers
  function allMatches() {
    const a = state.data.analysis;
    const seen = new Set();
    const out = [];
    for (const m of [...a.cachCuc, ...a.cung.flatMap((c) => c.luat)]) {
      const k = m.id + ':' + m.chi;
      if (!seen.has(k)) { seen.add(k); out.push(m); }
    }
    return out;
  }
  function vBadge(dg) { return dg ? `<span class="verdict ${dg}">${DG[dg]}</span>` : ''; }
  function ruleCard(m) {
    const key = 'r:' + m.id + ':' + m.chi + ':' + (m.boi || '');
    const hitsTxt = m.hits.length ? m.hits.map((h) => `${state.data.sao[h.id]?.ten || h.id} (${CHI[h.chi]})`).join(', ') : '';
    return `<div class="card ${m.danhGia} clickable ${state.activeKey === key ? 'active' : ''}" data-key="${esc(key)}" data-hits='${esc(JSON.stringify(m.hits))}' data-cung='${JSON.stringify([m.chi])}'>
      <h4>${esc(m.ten)} ${vBadge(m.danhGia)} <span class="meta">· ${esc(m.cungTen)}${m.boi === 'dai-han' ? ' · đại hạn' : m.boi === 'tieu-han' ? ' · tiểu hạn' : ''}${m.mucDo === 3 ? ' · ★ cách lớn' : ''}</span></h4>
      <p>${esc(m.ketLuan)}</p>
      ${m.nguyenVan ? `<p class="nv">“${esc(m.nguyenVan)}”</p>` : ''}
      <p class="meta">${hitsTxt ? 'Bộ sao: ' + esc(hitsTxt) + ' · ' : ''}${(m.chuDe || []).map((c) => CHU_DE[c] || c).join(', ')}${m.trang ? ' · tr.' + m.trang : ''}</p>
    </div>`;
  }
  function mucCard(m) {
    const key = 'm:' + m.key;
    const click = (m.hits && m.hits.length) || (m.cung && m.cung.length);
    return `<div class="card ${m.danhGia || 'trung'} ${click ? 'clickable' : ''} ${state.activeKey === key ? 'active' : ''}" ${click ? `data-key="${esc(key)}" data-hits='${esc(JSON.stringify(m.hits || []))}' data-cung='${JSON.stringify((m.cung || []).filter(Boolean))}'` : ''}>
      <h4>${esc(m.tieuDe)} ${vBadge(m.danhGia)} ${m.trang ? `<span class="meta">tr.${esc(m.trang)}</span>` : ''}</h4>
      ${m.giaTri ? `<div class="val">${esc(m.giaTri)}</div>` : ''}
      <p>${esc(m.noiDung)}</p>
    </div>`;
  }

  function renderTongQuan() {
    const a = state.data.analysis;
    return `<h3 class="section-title">Bước 1 · Quan sát tổng quát lá số</h3>
      <p class="lead">Thầy tử vi nhìn bao quát trước khi đi vào từng cung: gốc rễ Can Chi, tương quan Mệnh – Cục, âm dương, thế đứng của chính tinh, bố cục trung tinh và các vòng sao.</p>
      ${a.tongQuan.map(mucCard).join('')}
      ${a.cachCuc.length ? `<h3 class="section-title">Cách cục nổi bật ở Mệnh – Thân</h3>${a.cachCuc.slice(0, 8).map(ruleCard).join('')}` : ''}`;
  }

  function scoreBar(d) {
    const pct = Math.max(4, Math.min(100, ((d + 6) / 18) * 100));
    return `<span class="bar"><i style="width:${pct}%"></i></span>`;
  }
  function renderCung() {
    const a = state.data.analysis;
    const P = state.data.chart.palaces;
    return `<h3 class="section-title">Bước 2 · Phân tích từng cung</h3>
      <p class="lead">Thứ tự ưu tiên các cung cường của ${state.data.chart.thienBan.gioiTinh === 'nam' ? 'nam mệnh: Mệnh, Thân, Phúc, Quan, Tài, Di, Thê' : 'nữ mệnh: Mệnh, Thân, Phúc, Phu, Tài, Tử'}; sau đó đến các cung còn lại. Mỗi cung xét vị trí, tam hợp – xung chiếu – nhị hợp – giáp, sao tọa thủ và chiếu hợp, miếu hãm, ngũ hành, Tuần Triệt và các bộ sao.</p>
      ${a.cung.map((c, i) => `<details class="palace" data-chi="${c.chi}" ${state.sel === c.chi || (!state.sel && i === 0) ? 'open' : ''}>
        <summary><h3>${esc(c.ten)} <span class="meta">· ${esc(P[c.chi].canTen)} ${esc(c.chiTen)}</span></h3>
          <span class="score">${scoreBar(c.diem)} ${esc(c.xepLoai)}</span>
          <span class="sum">${esc(c.tomTat)}</span></summary>
        <div class="body">
          <dl class="kv">${c.viTri.map((v) => `<dt>${esc(v.tieuDe)}</dt><dd ${v.cung ? `class="link" data-cung-only='${JSON.stringify(v.cung)}' data-key="v:${c.chi}:${v.key}"` : ''}>${esc(v.noiDung)}</dd>`).join('')}</dl>
          <div class="sub">Chính tinh</div>
          ${c.chinhTinh.length ? c.chinhTinh.map((s) => `<p class="starline"><b data-star="${esc(s.id)}" data-chi="${c.chi}" class="hanh-${esc(state.data.sao[s.id]?.hanh ? { K: 'Kim', M: 'Mộc', T: 'Thủy', H: 'Hỏa', O: 'Thổ' }[state.data.sao[s.id].hanh] : '')}">${esc(s.ten)}</b>${s.dacTinh ? ` <span class="meta">(${TEN_DAC[s.dacTinh]})</span>` : ''} — ${esc(s.y || 'chưa có giải nghĩa')}</p>`).join('') : `<p class="starline">${esc(c.muonSao || 'Vô chính diệu')}</p>`}
          ${c.nguHanh.length ? `<div class="sub">Ngũ hành sao – cung – mệnh</div>${c.nguHanh.map(mucCard).join('')}` : ''}
          ${c.tuanTriet ? `<div class="sub">Tuần – Triệt</div>${mucCard(c.tuanTriet)}` : ''}
          <div class="sub">Trung tinh, phụ tinh</div>
          <div class="chips">${c.phuTinh.map((s) => `<span class="chip ${s.nhom}" data-star="${esc(s.id)}" data-chi="${c.chi}" title="${esc(s.y)}">${esc(s.ten)}${s.dacTinh ? ' ' + s.dacTinh : ''}</span>`).join('')}</div>
          ${c.luat.length ? `<div class="sub">Bộ sao & phú đoán (${c.luat.length})</div>${c.luat.map(ruleCard).join('')}` : '<p class="meta">Chưa có câu phú nào khớp với cung này.</p>'}
        </div></details>`).join('')}`;
  }

  function renderBoSao() {
    const ms = allMatches();
    const f = ms.filter((m) => (!state.chuDeFilter || (m.chuDe || []).includes(state.chuDeFilter)) && (!state.dgFilter || m.danhGia === state.dgFilter))
      .sort((a, b) => b.mucDo - a.mucDo);
    const chuDe = [...new Set(ms.flatMap((m) => m.chuDe || []))];
    const cc = f.filter((m) => m.loai === 'cach-cuc');
    const other = f.filter((m) => m.loai !== 'cach-cuc');
    return `<h3 class="section-title">Cách cục & các bộ sao tương tác</h3>
      <p class="lead">Mỗi thẻ là một bộ sao/cách cục trong sách khớp với lá số. Bấm vào thẻ để tô sáng các sao tạo thành bộ đó trên lá số. Tổng: ${ms.length} kết luận từ ${state.data.analysis.thongKe.soLuat} câu phú/luật.</p>
      <div class="chips"><span class="chip ${!state.dgFilter ? 'on' : ''}" data-dg="">Tất cả</span><span class="chip cat ${state.dgFilter === 'cat' ? 'on' : ''}" data-dg="cat">Cát</span><span class="chip hung ${state.dgFilter === 'hung' ? 'on' : ''}" data-dg="hung">Hung</span><span class="chip ${state.dgFilter === 'trung' ? 'on' : ''}" data-dg="trung">Trung tính</span></div>
      <div class="chips"><span class="chip ${!state.chuDeFilter ? 'on' : ''}" data-cd="">Mọi chủ đề</span>${chuDe.map((c) => `<span class="chip ${state.chuDeFilter === c ? 'on' : ''}" data-cd="${c}">${CHU_DE[c] || c}</span>`).join('')}</div>
      ${cc.length ? `<div class="sub">Cách cục (${cc.length})</div>${cc.map(ruleCard).join('')}` : ''}
      ${other.length ? `<div class="sub">Bộ sao, phú đoán (${other.length})</div>${other.map(ruleCard).join('')}` : ''}
      ${!f.length ? '<p class="meta">Không có kết luận nào theo bộ lọc này.</p>' : ''}`;
  }

  function color(d) {
    if (d >= 5) return '#3f8a46';
    if (d >= 1.5) return '#7aa84a';
    if (d >= -1.5) return '#b8913a';
    if (d >= -4) return '#c46a32';
    return '#a8322a';
  }
  function renderVan() {
    const a = state.data.analysis;
    const nx = a.namXem;
    const l = nx.luu;
    return `<h3 class="section-title">Đại hạn 10 năm</h3>
      <p class="lead">Mỗi ô là một đại hạn (tuổi mụ). Màu thể hiện độ mạnh của cung hạn; khung đen là đại hạn đang đi. Bấm để xem cung trên lá số.</p>
      <div class="timeline">${a.daiHan.map((d) => `<div class="tl ${d.dangChay ? 'now' : ''} ${state.sel === d.chi ? 'sel' : ''}" style="background:${color(d.diem)}" data-dh="${d.chi}" title="${esc(d.ten)}: ${esc(d.chinhTinh)} – ${esc(d.xepLoai)}">
        <b>${d.tuTuoi}–${d.denTuoi}</b><small>${esc(d.ten)}</small><small>${d.tuNam}</small></div>`).join('')}</div>
      ${(() => {
        const d = a.daiHan.find((x) => x.chi === state.sel) || a.daiHan.find((x) => x.dangChay);
        if (!d) return '';
        return `<div class="card ${d.diem >= 1.5 ? 'cat' : d.diem <= -1.5 ? 'hung' : 'trung'}"><h4>Đại hạn ${d.tuTuoi}–${d.denTuoi} tuổi (${d.tuNam}–${d.denNam}) · cung ${esc(d.ten)} ${esc(d.chiTen)}</h4>
          <p>Chính tinh: ${esc(d.chinhTinh)} · ${esc(d.xepLoai)}</p></div>${d.luat.map(ruleCard).join('')}`;
      })()}
      <h3 class="section-title">Lưu niên</h3>
      <div class="yearbar"><button data-year="-1">◀</button><span class="y">${l.namXem}</span><span>${esc(l.canChi)} · ${l.tuoi} tuổi</span><button data-year="1">▶</button>
        <span class="score">${scoreBar(nx.diemTieuHan)} Tiểu hạn: ${esc(nx.xepLoai)}</span></div>
      ${nx.muc.map(mucCard).join('')}
      ${nx.luat.length ? `<div class="sub">Phú đoán hạn khớp (${nx.luat.length})</div>${nx.luat.map(ruleCard).join('')}` : '<p class="meta">Không có câu phú hạn nào khớp năm này.</p>'}
      <div class="sub">Lưu nguyệt ${l.namXem}</div>
      <div class="months">${nx.thang.map((t) => `<div class="month" data-month="${t.chi}" style="border-top:4px solid ${color(t.diem)}"><b>Tháng ${t.thang}</b>${esc(CHI[t.chi])} · ${esc(t.ten)}<br><span class="meta">${esc(t.xepLoai)}</span></div>`).join('')}</div>`;
  }

  function renderTongKet() {
    const a = state.data.analysis;
    return `<h3 class="section-title">Tổng kết luận giải</h3>
      <p class="lead">Tổng hợp từ bản chất các sao, sự tương tác giữa chúng và các cung liên quan — đi từ gia đình, tính cách, số mệnh đến tình duyên, sự nghiệp, tài lộc, sức khỏe.</p>
      ${a.tongKet.map((t) => `<div class="card ${t.danhGia} clickable" data-key="tk:${t.key}" data-hits='[]' data-cung='${JSON.stringify(t.cung.map((c) => c.chi))}'>
        <h4>${esc(t.tieuDe)} ${vBadge(t.danhGia)}</h4>
        ${t.cung.map((c) => `<p><span class="score" style="display:inline-flex">${scoreBar(c.diem)}</span> ${esc(c.tomTat)}</p>`).join('')}
        ${t.diemNoi.length ? `<ul>${t.diemNoi.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '<p class="meta">Chưa có câu phú đặc thù cho chủ đề này — đánh giá dựa trên độ sáng của cung.</p>'}
        ${t.luat.length > t.diemNoi.length ? `<p class="meta">+ ${t.luat.length - t.diemNoi.length} kết luận khác ở tab Cách cục & bộ sao.</p>` : ''}
      </div>`).join('')}
      <h3 class="section-title">Năm ${a.namXem.luu.namXem}</h3>
      ${a.namXem.muc.slice(0, 2).map(mucCard).join('')}
      ${a.namXem.luat.slice(0, 5).map(ruleCard).join('')}`;
  }

  function renderContent() {
    const map = { tongquan: renderTongQuan, cung: renderCung, bosao: renderBoSao, van: renderVan, tongket: renderTongKet };
    $('#content').innerHTML = map[state.tab]();
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === state.tab));
  }
  function render() { renderChart(); renderContent(); }

  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (!b || !state.data) return;
    state.tab = b.dataset.tab;
    renderContent();
  });

  function onContentClick(e) {
    const st = e.target.closest('[data-star]');
    if (st) { showStar(st.dataset.star, +st.dataset.chi); return; }
    const card = e.target.closest('[data-key][data-hits]');
    if (card) { highlight(card.dataset.key, JSON.parse(card.dataset.hits || '[]'), JSON.parse(card.dataset.cung || '[]')); return; }
    const cOnly = e.target.closest('[data-cung-only]');
    if (cOnly) { highlight(cOnly.dataset.key, [], JSON.parse(cOnly.dataset.cungOnly)); return; }
    const dg = e.target.closest('[data-dg]');
    if (dg) { state.dgFilter = dg.dataset.dg || null; renderContent(); return; }
    const cd = e.target.closest('[data-cd]');
    if (cd) { state.chuDeFilter = cd.dataset.cd || null; renderContent(); return; }
    const dh = e.target.closest('[data-dh]');
    if (dh) { state.sel = +dh.dataset.dh; state.hits = []; state.hitCung = []; render(); return; }
    const mo = e.target.closest('[data-month]');
    if (mo) { highlight('mo:' + mo.dataset.month, [], [+mo.dataset.month]); return; }
    const yr = e.target.closest('[data-year]');
    if (yr) { form.namXem.value = (+form.namXem.value || new Date().getFullYear()) + +yr.dataset.year; fetchChart(); return; }
    const sum = e.target.closest('details.palace > summary');
    if (sum) { const chi = +sum.parentElement.dataset.chi; state.sel = chi; state.hits = []; state.hitCung = []; renderChart(); }
  }
  $('#content').addEventListener('click', onContentClick);

  if (loadForm()) fetchChart();
  else { form.ngay.value = 31; form.thang.value = 8; form.nam.value = 1998; form.gio.value = 11; }
})();
