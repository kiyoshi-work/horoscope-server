# Tử Vi Chính Biện — engine lá số & luận giải

Trường phái: theo sách *Tử Vi Chính Biện* (`src/files/58_TU_VI_THUC_HANH.pdf`), phần I (an sao, an Thân,
lưu hạn), phần II (chư tinh), phần III (cách luận số mệnh, phú đoán, đại tiểu hạn).

## Chạy

```bash
npm install
PORT=3000 npx nest start --watch -p tsconfig.build.json
# Web:  http://localhost:3000/            (giao diện mới)
# API:  http://localhost:3000/api/tuvi/laso?ngay=31&thang=8&nam=1998&gio=11&gioiTinh=nam&namXem=2026
# Hợp hôn: http://localhost:3000/hophon.html
# API:  http://localhost:3000/api/tuvi/hophon?a_ngay=31&a_thang=8&a_nam=1998&a_gio=11&b_ngay=12&b_thang=3&b_nam=2000&b_gio=5
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
| `hophon.ts` | Xem hợp hôn: đối chiếu hai lá số theo 5 lớp, vấn đề nếu thành, năm nên cưới |
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

## Xem hợp hôn (`hophon.ts`, trang `/hophon.html`)

Sách **không có** phép so hai lá số. Sách chỉ luận cung Phu Thê của từng người, hạn hôn phối (tr.138) và các câu phú.
Phần đối chiếu lấy theo thực hành phổ biến. Mỗi mục ghi nguồn `sach` (kèm trang), `thuc-hanh` (ngoài sách) hoặc
`tong-hop` (chương trình tự tổng hợp từ luận giải của từng lá số).

| Lớp | Trọng số | Nội dung |
|---|---|---|
| Tuổi & bản mệnh | 10% | Chi: tam hợp, lục hợp, lục xung, lục hại, tương hình. Can: ngũ hợp, tương xung. Nạp âm sinh khắc |
| Phu Thê ↔ Mệnh | 25% | Chính tinh ở Phu Thê người này so với chính tinh thủ Mệnh người kia, xét theo bộ (Tử Phủ Vũ Tướng, Sát Phá Liêm Tham, Cơ Nguyệt Đồng Lương, Cự Nhật) và theo hệ. Cộng thêm nền cung Phu Thê của mỗi người |
| Chồng lá số | 15% | Chi năm sinh và cung Mệnh của người kia rơi vào cung nào trên lá số mình. Vị trí hai cung Mệnh so với nhau |
| Tứ Hóa giao thoa | 30% | "Thái Tuế nhập quái": Tứ Hóa, Lộc Tồn, Kình, Đà theo can năm người kia đặt lên lá số mình |
| Bổ sung | 20% | So 9 phương diện (bù nhau hay cùng yếu). Tính khí động/tĩnh của chính tinh Mệnh. Giai đoạn cả hai cùng trũng hoặc cùng thịnh vận |

- **Vấn đề nếu thành:** dấu hiệu ở cung Phu Thê của hai người, gồm Tuần Triệt, Cô Quả (tr.85), sát tinh, Cự Môn, Không Kiếp hội Hồng Đào (tr.83), Tả Hữu hội Hồng Đào và Thất Sát (tr.138), Thiên Mã, Hóa Kỵ. Thêm các luật trong sách khớp tại Phu Thê. Dấu hiệu xuất hiện ở cả hai người được nêu riêng.
- **Năm cưới:** tam phương cung tiểu hạn hội đủ các bộ ở tr.138. Năm cả hai cùng có dấu hiệu là năm đẹp. Kim Lâu (tuổi mụ nữ chia 9 dư 1, 3, 6, 8) và năm xung tuổi là tục lệ: mỗi thứ hạ một bậc.
- **Điểm:** mỗi lớp được hiệu chỉnh để cặp ngẫu nhiên có trung vị khoảng 50–55 (`npx ts-node -T scripts/hophon-fuzz.ts 400`). Ví dụ đầy đủ một cặp: `npx ts-node -T scripts/hophon-demo.ts`.
