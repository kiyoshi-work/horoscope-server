# Tử Vi Chính Biện — engine lá số & luận giải

Trường phái: theo sách *Tử Vi Chính Biện* (`src/files/58_TU_VI_THUC_HANH.pdf`), phần I (an sao, an Thân,
lưu hạn), phần II (chư tinh), phần III (cách luận số mệnh, phú đoán, đại tiểu hạn).

## Chạy

```bash
npm install
PORT=3000 npx nest start --watch -p tsconfig.build.json
# Web:  http://localhost:3000/            (giao diện mới)
# API:  http://localhost:3000/api/tuvi/laso?ngay=31&thang=8&nam=1998&gio=11&gioiTinh=nam&namXem=2026
# Docs: http://localhost:3000/docs
npx jest src/tuvi                          # test engine an sao
node scripts/validate-kb.js src/tuvi/kb/*.json   # kiểm tra tri thức
npx ts-node -T scripts/kb-stats.ts 300     # tần suất khớp của từng luật
```

DB / VectorStore / AI tạm tách khỏi app (`src/app.module.ts`, `tsconfig.build.json`).

Tham số API: `gio` là chi giờ 1=Tý … 12=Hợi; `lich=am` + `thangNhuan=1` để nhập âm lịch;
`cachTinhNhuan=tach` để tính tháng nhuận sau ngày 15 sang tháng sau (mặc định giữ nguyên tháng).
Trên web có thể thêm `&tab=cung|bosao|van|tongket&cung=<1..12>` vào URL.

## Cấu trúc `src/tuvi/`

| File | Vai trò |
|---|---|
| `calendar.ts` | Đổi dương ↔ âm lịch (thuật toán Hồ Ngọc Đức) |
| `core.ts` | Can, Chi, ngũ hành, nạp âm, can cung (ngũ hổ độn), tam hợp/xung/nhị hợp/giáp |
| `chart.ts` | Lập lá số: Mệnh, Thân, Cục, 14 chính tinh, ~100 trung/phụ tinh, 3 vòng sao, Tuần Triệt, đại/tiểu/đồng hạn, miếu hãm |
| `han.ts` | Lưu niên: Cửu phi tinh lưu, Tuần Triệt lưu, lưu nguyệt, Nam/Bắc đẩu ứng hạn |
| `rules.ts` | Bộ đánh giá DSL luật, trả về "hits" (sao nào ở cung nào làm luật khớp) |
| `analysis.ts` | Quy trình luận giải: tổng quan → từng cung → vận hạn → tổng kết theo chủ đề |
| `kb/` | Tri thức: `catalog.json` (danh mục sao, nhóm), `stars-*.json` (bản chất sao), `rules-*.json` (cách cục, phú đoán, bộ sao, hạn). Đặc tả: `kb/SCHEMA.md` |

## Các điểm đã sửa so với bản port cũ (`src/shared/tuvi`)

- Vòng Tràng Sinh: Thai và Dưỡng bị đảo chỗ.
- Hỏa/Linh tuổi Tỵ Dậu Sửu bị đảo (sách: Hỏa khởi Mão, Linh khởi Tuất).
- Phá Toái sai nhóm tuổi (sách: Tý Ngọ Mão Dậu ở Tỵ; Dần Thân Tỵ Hợi ở Dậu; Thìn Tuất Sửu Mùi ở Sửu).
- Thiên Giải: lấy Thân làm tháng Giêng đếm thuận, không nhảy cung.
- Khôi/Việt tuổi Mậu, Canh, Nhâm, Đinh theo bài "Giáp Mậu nhị Ngưu Dương…".
- Tìm Cục khi Mệnh ở Tý/Sửu sai do phép chia lấy dư âm trong JS.
- Mệnh chủ/Thân chủ tra nhầm theo Can (đúng: theo Chi năm sinh); Thân chủ tuổi Tý là Hỏa Tinh.
- Các sao là đối tượng dùng chung giữa các lần lập lá số → miếu hãm của lá số trước "dính" sang lá số sau.
- Bổ sung: Thiên Khố, Lưu Tù, Đồng hạn, can của 12 cung, can giờ theo can ngày, lưu niên, lưu nguyệt.

Ghi chú trường phái: Lưu Tù tuổi Tỵ Dậu Sửu sách in "Sửu", engine lấy Dậu theo quy luật tam hợp;
ví dụ Hồng Loan tuổi Mùi sách in "Tý" mâu thuẫn với bài thơ an sao — engine theo bài thơ (Thân).
Khoa của tuổi Nhâm theo sách là "Phủ" (Thiên Phủ).

## Điểm cung

Điểm mỗi cung chỉ là thước đo tham khảo, cộng từ: chính tinh (miếu +3, vượng +2.5, đắc +2, bình +0.5,
hãm −2), Tam Hóa +1.5, lục cát/Lộc Tồn +1.2, sát tinh hãm −1.5 (đắc địa −0.4), Hóa Kỵ −1.5, cát/hung khác
±0.4/0.6; tam phương tính nửa trọng số; vô chính diệu −1; Tuần/Triệt nhân 0.65 (trấn áp cả tốt lẫn xấu).
