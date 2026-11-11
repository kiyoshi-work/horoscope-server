# Cơ sở tri thức Tử Vi — đặc tả dữ liệu

Nguồn: *Tử Vi Chính Biện* (`src/files/58_TU_VI_THUC_HANH.pdf`). Mọi luận giải phải bám sát sách,
ghi số trang (`trang`) để người dùng tra lại. Không bịa thêm nội dung ngoài sách; được phép diễn
lại câu phú cổ cho dễ hiểu (giữ câu gốc trong `nguyenVan`).

Danh mục sao + nhóm sao: `catalog.json` (`stars[].id`, `groups`). Chỉ dùng id có trong đó.
Tham chiếu nhóm bằng tiền tố `@`, ví dụ `"@luc-sat"`, `"@tam-hoa"`, `"@sat-pha-liem-tham"`.
Tuần/Triệt được coi như "sao" giả: `tuan`, `triet`.

Tên cung chuẩn: `Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách,
Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ` + `Thân` (cung Thân cư) + `Hạn` (cung đại/tiểu hạn đang xét).
Sách gọi tắt: Bào = Huynh Đệ, Phối/Thê = Phu Thê, Giải = Tật Ách, Trạch = Điền Trạch,
Quan = Quan Lộc, Tài = Tài Bạch, Phúc = Phúc Đức, Di/Thiên = Thiên Di, Nô = Nô Bộc, Tử = Tử Tức.

## 1. File luật (`rules-*.json`)

```json
{ "rules": [ Rule, ... ] }
```

```jsonc
Rule = {
  "id": "menh-tu-phu-dong-cung",      // duy nhất, kebab-case không dấu, có tiền tố theo file
  "ten": "Tử Phủ đồng cung",          // tên cách cục / bộ sao (ngắn, hiển thị như chip)
  "loai": "cach-cuc" | "phu-doan" | "tinh-chat" | "han",
  "cung": ["Mệnh", "Thân"],           // cung áp dụng; "*" = mọi cung (sao ở đâu xét ở đó)
  "gioiTinh": "nam" | "nu",           // tuỳ chọn
  "dieuKien": Cond,                    // điều kiện, đánh giá tương đối với "cung đang xét"
  "ketLuan": "Luận giải tiếng Việt, 1-3 câu, rõ ràng.",
  "danhGia": "cat" | "hung" | "trung",
  "mucDo": 1 | 2 | 3,                  // 3 = cách lớn/ảnh hưởng mạnh
  "chuDe": ["tinh-cach"],             // ⊂ tinh-cach, ngoai-hinh, su-nghiep, tai-loc, tinh-duyen,
                                       //   suc-khoe, tho-yeu, gia-dao, con-cai, phuc-duc, nha-cua,
                                       //   xuat-hanh, quan-he, tai-hoa, hoc-van
  "trang": 91,                         // trang sách (số in ở chân trang)
  "nguyenVan": "câu phú gốc (tuỳ chọn)"
}
```

## 2. Điều kiện (`Cond`)

| Dạng | Ý nghĩa |
|---|---|
| `{"all":[Cond,...]}` / `{"any":[...]}` / `{"not":Cond}` | logic |
| `{"sao": "tu-vi"}` | sao (hoặc `"@nhom"`) có ở cung đang xét (mặc định `o:"toa"`) |
| `{"sao": ["tu-vi","thien-phu"], "o": "toa"}` | TẤT CẢ sao trong danh sách có trong phạm vi `o` |
| `{"sao": ["kinh-duong","da-la","hoa-tinh"], "o":"tamPhuong", "min": 2}` | ít nhất `min` sao có trong phạm vi |
| `{"sao":"thai-duong", "dacTinh":"sang"}` | kèm điều kiện miếu/hãm của chính sao đó: `"sang"`(M/V/Đ), `"ham"`(H), `"binh"`(B) hoặc mảng `["M","V"]` |
| `{"chi": ["Dần","Thân"]}` | cung đang xét nằm ở địa chi đó |
| `{"vcd": true}` | cung đang xét vô chính diệu |
| `{"giap": ["ta-phu","huu-bat"]}` | cung bị kẹp: một bên có sao 1, bên kia có sao 2 (hoặc nhóm `["@kinh-da"]` = hai bên đều có sao của nhóm) |
| `{"thanCu": true}` | Thân cư tại cung đang xét |
| `{"tai": "Phúc Đức", "dieuKien": Cond}` | đánh giá Cond tại một cung khác (đặt tên cung) |
| `{"canNam": ["Giáp","Kỷ"]}` `{"chiNam": ["Tý"]}` | năm sinh |
| `{"gioiTinh": "nam"}` `{"amDuong": ["duong-nam","am-nu"]}` | giới tính / âm dương |
| `{"menhHanh": ["Kim"]}` `{"cucHanh": ["Thủy"]}` | hành bản mệnh (nạp âm) / hành cục |
| `{"thangSinh": [1,2,3]}` `{"gioSinh": ["Tý","Ngọ"]}` | tháng âm lịch / giờ sinh |

Phạm vi `o`:
`toa` (tọa thủ tại cung) · `xung` (cung đối) · `tamHop` (2 cung tam hợp) · `chieu` (xung + tamHop) ·
`tamPhuong` (toa + xung + tamHop = tam phương tứ chính, "hội") · `nhiHop` (cung nhị hợp) ·
`giap` (một trong hai cung kề).

Quy ước dịch từ sách:
- "đóng / tọa / thủ / cư / ở Mệnh" → `o:"toa"`; "chiếu" → `o:"chieu"`; "hội / gặp / ngộ / phùng" → `o:"tamPhuong"`;
  "đồng cung" → `o:"toa"` với nhiều sao; "giáp" → `giap`; "xung phá" → `o:"xung"`.
- "sáng sủa / miếu / vượng / đắc địa" → `dacTinh:"sang"`; "hãm / lạc hãm / mờ ám" → `dacTinh:"ham"`.
- Bộ sao đi cặp: Khôi Việt, Xương Khúc, Tả Hữu, Long Phượng, Quang Quý, Thai Tọa, Thai Cáo, Hồng Đào,
  Khốc Hư, Tang Hổ, Cô Quả, Hình Riêu, Kình Đà, Không Kiếp, Hỏa Linh, Song Hao, Song Lộc (loc-ton + hoa-loc).
- Câu phú quá mơ hồ / không mã hoá được → bỏ qua (đừng mã hoá sai).
- Mỗi Cond phải đủ chặt: chứa ít nhất một điều kiện về sao hoặc vị trí, KHÔNG để `{}`.

## 3. File sao (`stars.json`)

```jsonc
{ "tu-vi": {
    "tomTat": "Đế tinh, chủ quyền uy, phúc thọ, giải ách.",   // 1 câu bản chất
    "tinhChat": "…",        // đoạn mô tả bản chất (2-5 câu)
    "tuongTrung": "…",      // biểu tượng (vd: vua, mặt trời…)
    "ngoaiHinh": "…",       // hình dáng khi thủ Mệnh (nếu sách có)
    "tinhCach": "…",
    "boPhan": "…",          // bộ phận cơ thể / bệnh tật liên quan
    "khiSang": "…",         // khi miếu vượng đắc địa
    "khiHam": "…",          // khi hãm địa
    "mieuDia": "Tỵ, Ngọ, Dần, Thân…",   // nếu sách liệt kê
    "hamDia": "…",
    "taiCung": { "Mệnh": "…", "Quan Lộc": "…" },   // ý nghĩa tại từng cung nếu sách có
    "trang": [24, 25]
} }
```
Trường nào sách không nói thì bỏ đi. Các bộ sao/tương tác của sao → viết thành Rule (`loai:"tinh-chat"`,
`cung:"*"` hoặc cung cụ thể) trong file `rules-sao-*.json`, điều kiện phải chứa chính sao đó ở `o:"toa"`.

## Kiểm tra

`node scripts/validate-kb.js src/tuvi/kb/<file>.json` — phải không còn lỗi.
