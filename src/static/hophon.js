/* Xem hợp hôn — đối chiếu hai lá số (vanilla JS) */
(() => {
  const CHI = ['', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const CHI_GIO = ['', '23h–1h', '1h–3h', '3h–5h', '5h–7h', '7h–9h', '9h–11h', '11h–13h', '13h–15h', '15h–17h', '17h–19h', '19h–21h', '21h–23h'];
  const POS = { 6: [1, 1], 7: [1, 2], 8: [1, 3], 9: [1, 4], 10: [2, 4], 11: [3, 4], 12: [4, 4], 1: [4, 3], 2: [4, 2], 3: [4, 1], 4: [3, 1], 5: [2, 1] };
  const TEN_DAC = { M: 'Miếu', V: 'Vượng', Đ: 'Đắc địa', B: 'Bình hòa', H: 'Hãm địa' };
  const MAJOR_TAGS = ['luc-cat', 'luc-sat', 'tam-hoa', 'loc', 'ma', 'khong-kiep', 'kinh-da'];
  const NGUON = { sach: 'Sách', 'thuc-hanh': 'Thực hành', 'tong-hop': 'Tổng hợp' };
  const BEN = { nam: '♂', nu: '♀' };
  const RADAR_NGAN = { 'tinh-cach': 'Tính cách', 'gia-dao': 'Gia đạo', 'phuc-duc': 'Phúc đức', 'tinh-duyen': 'Tình duyên', 'con-cai': 'Con cái', 'su-nghiep': 'Sự nghiệp', 'tai-loc': 'Tài lộc', 'suc-khoe': 'Sức khỏe', 'quan-he': 'Xã hội' };

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const state = { data: null, ben: 'nam', tab: 'tong', hits: [], cung: [], activeKey: null, openYear: null };

  // ───────────────────────── Form
  const form = $('#form');
  document.querySelectorAll('select.gio').forEach((sel) => { for (let i = 1; i <= 12; i++) sel.add(new Option(`Giờ ${CHI[i]} (${CHI_GIO[i]})`, i)); });
  const FIELDS = ['ten', 'ngay', 'thang', 'nam', 'gio', 'lich', 'thangNhuan'];
  function loadForm() {
    const q = new URLSearchParams(location.search);
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('tuvi-hophon') || '{}'); } catch { /* bỏ qua */ }
    let main = {};
    try { main = JSON.parse(localStorage.getItem('tuvi-form') || '{}'); } catch { /* bỏ qua */ }
    for (const p of ['a', 'b']) for (const f of FIELDS) {
      const k = `${p}_${f}`;
      let v = q.get(k) ?? saved[k];
      // điền sẵn người đã lập ở trang chính
      if (v == null && ((p === 'a' && main.gioiTinh !== 'nu') || (p === 'b' && main.gioiTinh === 'nu'))) v = main[f];
      if (v == null) continue;
      if (f === 'thangNhuan') form[k].checked = v === '1';
      else form[k].value = v;
    }
    form.namXem.value = q.get('namXem') || saved.namXem || new Date().getFullYear();
    if (q.get('tab')) state.tab = q.get('tab');
    return ['a', 'b'].every((p) => form[`${p}_ngay`].value && form[`${p}_nam`].value && form[`${p}_thang`].value);
  }
  function params() {
    const o = {};
    for (const p of ['a', 'b']) for (const f of FIELDS) {
      const k = `${p}_${f}`;
      o[k] = f === 'thangNhuan' ? (form[k].checked ? '1' : '0') : form[k].value.trim();
    }
    o.namXem = form.namXem.value || new Date().getFullYear();
    return o;
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); fetchData(); });

  async function fetchData() {
    const p = params();
    try { localStorage.setItem('tuvi-hophon', JSON.stringify(p)); } catch { /* bỏ qua */ }
    history.replaceState(null, '', '?' + new URLSearchParams({ ...p, tab: state.tab }));
    document.body.classList.add('loading');
    try {
      const res = await fetch('/api/tuvi/hophon?' + new URLSearchParams(p));
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Lỗi máy chủ');
      state.data = json;
      state.hits = []; state.cung = []; state.activeKey = null;
      $('#tenNam').textContent = json.hopHon.ten.nam;
      $('#tenNu').textContent = json.hopHon.ten.nu;
      render();
    } catch (err) {
      $('#content').innerHTML = `<div class="err">Không xem được: ${esc(err.message)}</div>`;
    } finally {
      document.body.classList.remove('loading');
    }
  }

  // ───────────────────────── Lá số
  const person = () => state.data[state.ben];
  function starHtml(s, extra = '') {
    const info = person().sao[s.id] || {};
    const hl = state.hits.some((h) => h.chi === s.chi && h.id === s.id);
    const mk = ($('#showChong').checked ? state.data.hopHon.chong[state.ben] : []).filter((d) => d.id === s.id && d.chi === s.chi);
    const tip = `${s.ten}${s.dacTinh ? ' – ' + TEN_DAC[s.dacTinh] : ''}${info.tomTat ? ': ' + info.tomTat : ''}${mk.map((m) => '\n◆ ' + m.tip).join('')}`;
    return `<span class="star hanh-${s.hanh || ''} ${s.dacTinh === 'H' ? 'ham' : ''} ${extra} ${hl ? 'hl' : ''}" title="${esc(tip)}">${esc(s.ten)}${s.dacTinh ? `<sup>${s.dacTinh}</sup>` : ''}${mk.map((m) => `<i class="mk hoa ${m.loai}">${esc(m.nhan)}</i>`).join('')}</span>`;
  }
  function renderChart() {
    const { chart, sao } = person();
    const tb = chart.thienBan;
    const P = chart.palaces;
    const other = state.ben === 'nam' ? 'nu' : 'nam';
    const chong = $('#showChong').checked ? state.data.hopHon.chong[state.ben].filter((d) => !d.id) : [];
    const hitCung = new Set([...state.hits.map((h) => h.chi), ...state.cung]);
    let html = '';
    for (let chi = 1; chi <= 12; chi++) {
      const p = P[chi];
      const stars = p.stars.map((s) => ({ ...s, chi }));
      const chinh = stars.filter((s) => s.loai === 'chinh');
      const others = stars.filter((s) => s.loai !== 'chinh' && s.loai !== 'vong-trang-sinh');
      const major = (s) => ((sao[s.id] || {}).tags || []).some((t) => MAJOR_TAGS.includes(t)) || s.id === 'hoa-ky';
      const good = others.filter((s) => s.nhom !== 'hung').sort((a, b) => major(b) - major(a));
      const bad = others.filter((s) => s.nhom === 'hung').sort((a, b) => major(b) - major(a));
      const badges = [p.isThan ? '<span class="badge">Thân</span>' : '', p.tuan ? '<span class="badge tuan">Tuần</span>' : '', p.triet ? '<span class="badge triet">Triệt</span>' : ''].join('');
      const marks = chong.filter((d) => d.chi === chi);
      const cls = ['cell', p.ten === 'Mệnh' ? 'hh-menh' : '', p.ten === 'Phu Thê' ? 'hh-pt' : '', hitCung.has(chi) ? 'hl' : ''].join(' ');
      html += `<div class="${cls}" data-cell="${chi}" style="grid-row:${POS[chi][0]};grid-column:${POS[chi][1]}">
        <div class="cell-head"><span class="cc">${esc(p.canTen)} ${esc(p.chiTen)}</span><span class="name">${esc(p.ten)}${badges}</span><span class="dh">${p.daiHan}</span></div>
        ${marks.length ? `<div class="mks">${marks.map((m) => `<span class="mk ${m.loai} ${other}" title="${esc(m.tip)}">${BEN[other]} ${esc(m.nhan)}</span>`).join('')}</div>` : ''}
        <div class="chinh">${chinh.length ? chinh.map((s) => starHtml(s)).join('') : '<span class="meta">(vô chính diệu)</span>'}</div>
        <div class="phu"><div class="col">${good.map((s) => starHtml(s, major(s) ? 'major' : '')).join('')}</div><div class="col r">${bad.map((s) => starHtml(s, major(s) ? 'major' : '')).join('')}</div></div>
      </div>`;
    }
    const ct = (ten) => { const p = P.find((x) => x && x.ten === ten); return p.stars.filter((s) => s.loai === 'chinh').map((s) => s.ten).join(', ') || 'VCĐ'; };
    html += `<div class="center">
      <h2 class="${state.ben}">${BEN[state.ben]} ${esc(state.data.hopHon.ten[state.ben])}</h2>
      <div class="row"><span>Dương lịch</span><b>${tb.duongLich.ngay}/${tb.duongLich.thang}/${tb.duongLich.nam} · giờ ${CHI[tb.chiGio]}</b></div>
      <div class="row"><span>Âm lịch</span><b>${tb.amLich.ngay}/${tb.amLich.thang}${tb.amLich.nhuan ? ' (nhuận)' : ''}/${tb.amLich.nam}</b></div>
      <div class="row"><span>Năm sinh</span><b>${esc(tb.canChi.nam)} · ${esc(tb.amDuongTen)}</b></div>
      <div class="row"><span>Bản mệnh</span><b class="hanh-${tb.menh.hanh}">${esc(tb.menh.napAm)}</b></div>
      <div class="row"><span>Cục</span><b class="hanh-${tb.cuc.hanh}">${esc(tb.cuc.ten)}</b></div>
      <div class="row"><span>Mệnh</span><b>${esc(ct('Mệnh'))}</b></div>
      <div class="row"><span>Phu Thê</span><b>${esc(ct('Phu Thê'))}</b></div>
    </div>`;
    const el = $('#chart');
    el.innerHTML = html;
    el.classList.toggle('focusing', hitCung.size > 0);
    document.querySelectorAll('#switch button').forEach((b) => b.classList.toggle('on', b.dataset.ben === state.ben));
  }
  $('#showChong').addEventListener('change', () => state.data && renderChart());
  $('#switch').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !state.data) return;
    state.ben = b.dataset.ben; state.hits = []; state.cung = []; state.activeKey = null;
    renderChart();
    document.querySelectorAll('.ev.on').forEach((x) => x.classList.remove('on'));
  });

  // ───────────────────────── Thành phần dùng chung
  const c100 = (d) => (d >= 70 ? 'var(--cat)' : d >= 55 ? 'var(--gold)' : d >= 42 ? 'var(--trung)' : 'var(--hung)');
  const src = (n, trang) => `<span class="src ${n}" title="${n === 'sach' ? 'Trích từ Tử Vi Chính Biện' : n === 'thuc-hanh' ? 'Kinh nghiệm thực hành phổ biến, ngoài sách' : 'Chương trình tổng hợp từ luận giải từng lá số'}">${NGUON[n]}${trang ? ' tr.' + trang : ''}</span>`;
  function evChip(b, key) {
    return `<span class="ev ${b.ben}" data-key="${esc(key)}" data-ben="${b.ben}" data-hits='${esc(JSON.stringify(b.hits))}' data-cung='${JSON.stringify(b.cung)}' title="Bấm để tô sáng trên lá số">${BEN[b.ben]} ${esc(b.ten)}</span>`;
  }
  const evs = (list, key) => (list && list.length ? `<div class="tk-ev">${list.map((b, i) => evChip(b, `${key}-${i}`)).join('')}</div>` : '');
  const sign = (d) => `<span class="pt ${d > 0.25 ? 'cat' : d < -0.25 ? 'hung' : 'trung'}">${d > 0 ? '+' : ''}${d}</span>`;
  const huong = (h) => (h === 'chung' || !h ? '<span class="dir">Chung</span>' : `<span class="dir ${h}">→ ${BEN[h]} ${esc(state.data.hopHon.ten[h])}</span>`);
  const ring = (d, size = 120) => `<div class="hh-ring" style="--p:${d};--c:${c100(d)};width:${size}px;height:${size}px"><b>${d}</b><small>/100</small></div>`;

  // ───────────────────────── Tab 1: Tổng quan
  function renderTong() {
    const h = state.data.hopHon;
    const A = state.data.nam.chart.thienBan, B = state.data.nu.chart.thienBan;
    return `<div class="hh-hero">
        ${ring(h.diem, 132)}
        <div class="hh-hero-t">
          <div class="tk-kicker">${esc(h.xepLoai)}</div>
          <h3 class="tk-title">${esc(h.tieuDe)}</h3>
          <div class="hh-pair"><span class="nam">♂ ${esc(h.ten.nam)} · ${esc(A.canChi.nam)} · ${esc(A.menh.napAm)}</span><span class="nu">♀ ${esc(h.ten.nu)} · ${esc(B.canChi.nam)} · ${esc(B.menh.napAm)}</span></div>
        </div>
      </div>
      ${h.tomTat.map((t) => `<p class="hh-p">${esc(t)}</p>`).join('')}
      <h3 class="section-title">Năm lớp đối chiếu</h3>
      <p class="lead">Mỗi lớp được chấm từ 0 đến 100. Tổng điểm là trung bình có trọng số của năm lớp. Bấm vào một lớp để xem chi tiết.</p>
      <div class="hh-layers">${h.lop.map((l) => `<a class="hh-layer" data-goto="${l.key}">
        <span class="nm">${esc(l.ten)} ${src(l.nguon)}</span>
        <span class="bar"><i style="width:${l.diem}%;background:${c100(l.diem)}"></i></span>
        <b style="color:${c100(l.diem)}">${l.diem}</b><small>×${Math.round(l.trongSo * 100)}%</small></a>`).join('')}</div>
      <h3 class="section-title">Nổi bật</h3>
      <div class="hh-cols">
        <div><div class="sub">Gắn kết</div>${top(1)}</div>
        <div><div class="sub">Cần lưu tâm</div>${top(-1)}</div>
      </div>`;
  }
  function top(sg) {
    const all = state.data.hopHon.lop.flatMap((l) => l.muc.map((m, i) => ({ ...m, key: `${l.key}-${i}` })));
    const list = all.filter((m) => m.diem * sg > 0).sort((a, b) => b.diem * sg - a.diem * sg).slice(0, 4);
    if (!list.length) return '<p class="meta">Không có.</p>';
    return list.map((m) => `<div class="card ${m.danhGia}"><h4>${esc(m.tieuDe)} ${sign(m.diem)}</h4><p>${esc(m.noiDung)}</p>${evs(m.bangChung, m.key)}</div>`).join('');
  }

  // ───────────────────────── Tab 2: các lớp
  function renderLop() {
    return state.data.hopHon.lop.map((l) => `<section class="tk-topic hh-lop" id="lop-${l.key}">
      <header><div class="tk-ring" style="--p:${l.diem};--c:${c100(l.diem)}"><b>${l.diem}</b><small>/100</small></div>
        <div class="tk-h"><div class="tk-kicker">Trọng số ${Math.round(l.trongSo * 100)}% · ${src(l.nguon)}</div><h4>${esc(l.ten)}</h4></div></header>
      <p class="lead">${esc(l.moTa)}</p>
      <ul class="hh-items">${l.muc.map((m, i) => `<li class="${m.danhGia}">
        <div class="hh-it-h"><b>${esc(m.tieuDe)}</b>${sign(m.diem)}${huong(m.huong)}${src(m.nguon, m.trang)}</div>
        <p>${esc(m.noiDung)}</p>${evs(m.bangChung, `${l.key}-${i}`)}</li>`).join('')}</ul>
    </section>`).join('');
  }

  // ───────────────────────── Tab 3: bổ sung
  function radar2(pd) {
    const n = pd.length, R = 100, cx = 170, cy = 140;
    const pt = (i, r) => { const g = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + r * Math.cos(g), cy + r * Math.sin(g)]; };
    const ring = (f) => pd.map((_, i) => pt(i, R * f).join(',')).join(' ');
    const poly = (k) => pd.map((c, i) => pt(i, (R * c[k]) / 100).join(',')).join(' ');
    return `<svg class="radar hh-radar" viewBox="0 0 340 290" role="img" aria-label="So sánh 9 phương diện">
      ${[0.25, 0.5, 0.75, 1].map((f) => `<polygon points="${ring(f)}" class="r-ring"/>`).join('')}
      ${pd.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}" class="r-axis"/>`).join('')}
      <polygon points="${poly('nam')}" class="r-nam"/><polygon points="${poly('nu')}" class="r-nu"/>
      ${pd.map((c, i) => { const [x, y] = pt(i, R + 16); const anc = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end';
        return `<text x="${x}" y="${y + 4}" text-anchor="${anc}" class="r-lbl ${c.danhGia}">${esc(RADAR_NGAN[c.key] || c.tieuDe)}</text>`; }).join('')}
    </svg>`;
  }
  function lifeline2(dd) {
    const all = [...dd.nam, ...dd.nu];
    if (!all.length) return '';
    const y0 = Math.min(...all.map((d) => d.nam)), y1 = Math.max(...all.map((d) => d.nam));
    const W = 640, H = 200, L = 30, Rr = 10, T = 14, B = 26;
    const x = (y) => L + ((y - y0) * (W - L - Rr)) / Math.max(1, y1 - y0);
    const y = (v) => T + ((100 - v) * (H - T - B)) / 100;
    const path = (s) => s.map((d, i) => `${i ? 'L' : 'M'}${x(d.nam).toFixed(1)},${y(d.diem).toFixed(1)}`).join(' ');
    const now = new Date().getFullYear();
    const ticks = []; for (let t = Math.ceil(y0 / 10) * 10; t <= y1; t += 10) ticks.push(t);
    return `<svg class="lifeline" viewBox="0 0 ${W} ${H}" role="img" aria-label="Đường đời hai người theo năm">
      ${dd.giaiDoan.map((g) => `<rect x="${x(g.tuNam)}" y="${T}" width="${Math.max(3, x(g.denNam + 1) - x(g.tuNam))}" height="${H - T - B}" class="band ${g.loai}"><title>${esc(g.noiDung)}</title></rect>`).join('')}
      ${[25, 50, 75].map((v) => `<line x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}" class="ll-grid"/><text x="${L - 5}" y="${y(v) + 4}" text-anchor="end" class="ll-ax">${v}</text>`).join('')}
      ${ticks.map((t) => `<text x="${x(t)}" y="${H - 8}" text-anchor="middle" class="ll-ax">${t}</text>`).join('')}
      ${now >= y0 && now <= y1 ? `<line x1="${x(now)}" x2="${x(now)}" y1="${T}" y2="${H - B}" class="ll-now"/><text x="${x(now)}" y="${T - 3}" text-anchor="middle" class="ll-nowt">nay</text>` : ''}
      <path d="${path(dd.nam)}" class="l-nam"/><path d="${path(dd.nu)}" class="l-nu"/>
    </svg>`;
  }
  function renderBoSung() {
    const h = state.data.hopHon;
    const l5 = h.lop.find((l) => l.key === 'bo-sung');
    return `<h3 class="section-title">9 phương diện chồng lên nhau</h3>
      <div class="hh-legend"><span class="nam">♂ ${esc(h.ten.nam)}</span><span class="nu">♀ ${esc(h.ten.nu)}</span></div>
      ${radar2(h.phuongDien)}
      <table class="hh-tbl"><thead><tr><th>Phương diện</th><th class="nam">♂</th><th class="nu">♀</th><th>Nhận xét</th></tr></thead><tbody>
      ${h.phuongDien.map((p) => `<tr class="${p.danhGia}"><td>${esc(p.tieuDe)}</td><td><span class="mini" style="--p:${p.nam};--c:var(--nam)"></span>${p.nam}</td><td><span class="mini" style="--p:${p.nu};--c:var(--nu)"></span>${p.nu}</td><td>${esc(p.ketLuan)}</td></tr>`).join('')}
      </tbody></table>
      <h3 class="section-title">Đường đời đặt cạnh nhau</h3>
      <p class="lead">Điểm đại hạn của mỗi người tính theo năm dương lịch. Dải đỏ là giai đoạn cả hai cùng trũng vận, dải xanh là cả hai cùng thịnh vận.</p>
      ${lifeline2(h.duongDoi)}
      ${h.duongDoi.giaiDoan.map((g) => `<p class="tk-peak ${g.loai === 'cung-tram' ? 'hung' : 'cat'}">${g.loai === 'cung-tram' ? '▼' : '▲'} ${esc(g.noiDung)}</p>`).join('') || '<p class="meta">Không có giai đoạn nào cả hai cùng trũng hay cùng thịnh rõ rệt.</p>'}
      <h3 class="section-title">Kết luận lớp bổ sung</h3>
      ${l5.muc.filter((m) => !/^Cùng (trũng|thịnh)/.test(m.tieuDe)).map((m, i) => `<div class="card ${m.danhGia}"><h4>${esc(m.tieuDe)} ${sign(m.diem)} ${src(m.nguon)}</h4><p>${esc(m.noiDung)}</p>${evs(m.bangChung, `bs-${i}`)}</div>`).join('')}`;
  }

  // ───────────────────────── Tab 4: vấn đề
  function renderVanDe() {
    const v = state.data.hopHon.vanDe;
    const risk = v.filter((x) => x.danhGia !== 'cat');
    const good = v.filter((x) => x.danhGia === 'cat');
    const groups = {};
    risk.forEach((x, i) => (groups[x.nhom] ||= []).push({ ...x, i }));
    const benTag = (b) => (b === 'chung' ? '<span class="dir">Cả hai</span>' : `<span class="dir ${b}">${BEN[b]} ${esc(state.data.hopHon.ten[b])}</span>`);
    const item = (x, k) => `<li class="${x.danhGia}"><div class="hh-it-h"><b>${esc(x.tieuDe)}</b>${benTag(x.ben)}${src(x.nguon, x.trang)}</div><p>${esc(x.noiDung)}</p>${evs(x.bangChung, k)}</li>`;
    return `<p class="lead">Nếu hai người thành vợ chồng, những điều dưới đây là chỗ dễ phát sinh chuyện. Chúng được rút từ cung Phu Thê của cả hai lá số và từ các mặt mà cả hai cùng yếu. Dấu hiệu xuất hiện ở cả hai người thì dễ ứng hơn.</p>
      <h3 class="section-title">Rủi ro cần lưu tâm <span class="meta">(${risk.length})</span></h3>
      ${Object.entries(groups).map(([g, list]) => `<div class="hh-grp"><div class="sub">${esc(g)}</div><ul class="hh-items">${list.map((x) => item(x, `vd-${x.i}`)).join('')}</ul></div>`).join('') || '<p class="meta">Không thấy dấu hiệu xấu nổi bật.</p>'}
      <h3 class="section-title">Điểm tựa của cuộc hôn nhân <span class="meta">(${good.length})</span></h3>
      <ul class="hh-items">${good.map((x, i) => item(x, `vg-${i}`)).join('') || '<p class="meta">Không có.</p>'}</ul>`;
  }

  // ───────────────────────── Tab 5: năm cưới
  const XH = { dep: 'Đẹp', kha: 'Khá', thuong: 'Bình thường', tranh: 'Nên tránh' };
  function renderNam() {
    const h = state.data.hopHon;
    const open = h.namCuoi.find((n) => n.nam === state.openYear);
    return `<p class="lead">Theo sách (tr.138), năm có hôn phối là năm mà tam phương cung tiểu hạn hội đủ một trong các bộ: Sát Phá Liêm gặp Đào · Vũ Diêu Lộc Mã Hỉ Đào · Tả Hữu Hồng Hỉ · Long Phượng Hỉ Thần · Đào Hồng Nhật Nguyệt. Năm <b>đẹp</b> là năm cả hai cùng có dấu hiệu và không phạm cấm kỵ. Phần Kim Lâu và năm xung tuổi là tục lệ dân gian, không có trong sách.</p>
      <div class="hh-years">${h.namCuoi.map((n) => `<button class="hh-year ${n.xepHang} ${state.openYear === n.nam ? 'sel' : ''}" data-year="${n.nam}">
        <b>${n.nam}</b><small>${esc(n.canChi)}</small>
        <span class="dots"><i class="nam" title="${n.dauHieuNam.length} dấu hiệu bên nam">${'●'.repeat(Math.min(3, n.dauHieuNam.length)) || '○'}</i><i class="nu" title="${n.dauHieuNu.length} dấu hiệu bên nữ">${'●'.repeat(Math.min(3, n.dauHieuNu.length)) || '○'}</i></span>
        <em>${XH[n.xepHang]}</em>${n.canhBao.length ? '<span class="warn">!</span>' : ''}</button>`).join('')}</div>
      <div class="hh-legend"><span class="nam">● dấu hiệu bên nam</span><span class="nu">● dấu hiệu bên nữ</span><span>! có cấm kỵ theo tục lệ</span></div>
      ${open ? `<div class="card ${open.danhGia} hh-ydetail"><h4>Năm ${open.nam} (${esc(open.canChi)}) · ${XH[open.xepHang]}</h4>
        <p><b class="c-nam">♂ ${esc(h.ten.nam)}, ${open.tuoiNam} tuổi:</b> ${open.dauHieuNam.length ? esc(open.dauHieuNam.join(' · ')) : 'không có dấu hiệu hôn phối'}</p>
        <p><b class="c-nu">♀ ${esc(h.ten.nu)}, ${open.tuoiNu} tuổi:</b> ${open.dauHieuNu.length ? esc(open.dauHieuNu.join(' · ')) : 'không có dấu hiệu hôn phối'}</p>
        ${open.canhBao.length ? `<p class="hh-warn">⚠ ${esc(open.canhBao.join(' · '))} ${src('thuc-hanh')}</p>` : ''}
        ${evs(open.bangChung, `y-${open.nam}`)}</div>` : '<p class="meta">Bấm vào một năm để xem chi tiết và tô sáng cung tiểu hạn.</p>'}`;
  }

  // ───────────────────────── Khung
  const TABS = { tong: renderTong, lop: renderLop, bosung: renderBoSung, vande: renderVanDe, nam: renderNam };
  function renderContent() {
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === state.tab));
    $('#content').innerHTML = TABS[state.tab]();
    if (state.activeKey) document.querySelectorAll(`.ev[data-key="${CSS.escape(state.activeKey)}"]`).forEach((x) => x.classList.add('on'));
  }
  function render() { renderChart(); renderContent(); }
  function setTab(t) {
    state.tab = t;
    const q = new URLSearchParams(location.search); q.set('tab', t); history.replaceState(null, '', '?' + q);
    if (state.data) renderContent();
  }
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setTab(b.dataset.tab); });

  $('#content').addEventListener('click', (e) => {
    const ev = e.target.closest('.ev');
    if (ev) {
      const key = ev.dataset.key;
      if (state.activeKey === key) { state.activeKey = null; state.hits = []; state.cung = []; }
      else { state.activeKey = key; state.ben = ev.dataset.ben; state.hits = JSON.parse(ev.dataset.hits); state.cung = JSON.parse(ev.dataset.cung); }
      document.querySelectorAll('.ev.on').forEach((x) => x.classList.remove('on'));
      if (state.activeKey) ev.classList.add('on');
      renderChart();
      if (window.innerWidth < 1100 && state.activeKey) $('#chart').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const go = e.target.closest('[data-goto]');
    if (go) { setTab('lop'); requestAnimationFrame(() => $(`#lop-${go.dataset.goto}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })); return; }
    const y = e.target.closest('[data-year]');
    if (y) {
      const n = +y.dataset.year;
      state.openYear = state.openYear === n ? null : n;
      const ny = state.data.hopHon.namCuoi.find((x) => x.nam === n);
      if (state.openYear && ny) { const b = ny.bangChung.find((x) => x.ben === state.ben) || ny.bangChung[0]; state.activeKey = `y-${n}-${ny.bangChung.indexOf(b)}`; state.hits = b.hits; state.cung = b.cung; }
      else { state.activeKey = null; state.hits = []; state.cung = []; }
      render();
    }
  });

  if (loadForm()) fetchData();
})();
