# Tử Vi — nhật ký tiến độ

Cập nhật: 2026-11-11. Chi tiết kỹ thuật, cách chạy: xem [`TUVI.md`](TUVI.md).

## Đã làm

### Engine lá số (`src/tuvi/`)
- Viết lại an sao theo *Tử Vi Chính Biện* và sửa các lỗi của bản port cũ (`src/shared/tuvi`):
  - Thai và Dưỡng bị đảo chỗ.
  - Hỏa/Linh tuổi Tỵ Dậu Sửu bị đảo.
  - Phá Toái sai nhóm tuổi; Thiên Giải an sai.
  - Khôi/Việt sai ở các tuổi Mậu, Canh, Nhâm, Đinh.
  - Tìm Cục sai khi Mệnh ở Tý/Sửu.
  - Mệnh chủ/Thân chủ tra theo Can thay vì Chi.
  - Miếu/hãm của lá số trước "dính" sang lá số sau.
- Bổ sung: Thiên Khố, Lưu Tù, Đồng hạn, can 12 cung, can giờ.
- Vận hạn (`han.ts`): đại hạn, tiểu hạn, lưu niên (9 sao lưu, Tuần/Triệt lưu), lưu đại hạn, lưu nguyệt, Nam/Bắc đẩu ứng hạn.
- Bộ đánh giá luật DSL (`rules.ts`); mỗi luật khớp trả về đúng các sao gây khớp để giao diện tô sáng.

### Tri thức trích từ sách (`src/tuvi/kb/`)
- 1.957 luật: cách cục, phú đoán, bộ sao, hạn.
- Bản chất của 113 sao.
- Qua `scripts/validate-kb.js`. Trên 400 lá số ngẫu nhiên không còn luật nào khớp quá 50% số lá số.

### Luận giải (`analysis.ts`) theo quy trình của thầy tử vi
1. **Tổng quan:**
   - Can Chi, Mệnh–Cục sinh khắc, âm dương.
   - Sinh/vượng/bại/tuyệt địa; mùa và giờ sinh; soát giờ sinh (Kim Xà, Quan Sát…).
   - Thế chính tinh, bố cục trung tinh.
   - Tràng Sinh, Khốc Hư, Tang Hổ, Tuần Triệt, sao chỉ bộ phận cơ thể.
2. **Từng cung** theo thứ tự cường cung:
   - Nam: Mệnh, Thân, Phúc, Quan, Tài, Di, Thê.
   - Nữ: Mệnh, Thân, Phúc, Phu, Tài, Tử.
3. **Cách cục & bộ sao.**
4. **Vận hạn:** đại hạn, năm xem, hạn đắc số/phản bối, năm kỵ theo tuổi, lưu nguyệt.
5. **Tổng kết theo chủ đề:** gia đình, tính cách, số mệnh, tình duyên, con cái, sự nghiệp, tài lộc, sức khỏe, xã hội.

### Web
- Giao diện mới ở `/` (`src/static/`):
  - Lá số 4×4, vẽ đường tam hợp và xung chiếu.
  - Bấm cung, sao hoặc bộ sao để tô sáng.
  - 5 tab luận giải, dòng thời gian đại hạn, chuyển năm xem.
  - Dùng được trên điện thoại.
- API: `GET /api/tuvi/laso`. Swagger: `/docs`.
- DB, VectorStore và AI tạm tách khỏi app theo yêu cầu.

### Phiên 2026-11-11
- **Sửa lỗi crash phần Tổng kết.** Lá số Thân cư Mệnh (khoảng 1/6 số lá số) không có mục "Thân" riêng nên API trả lỗi 500.
- **Thêm `scripts/fuzz.ts`.** Script chạy 8.000 bộ ngày sinh (năm 1900–2099, cả dương lịch và âm lịch). Sau khi sửa: 0 lỗi, không có `undefined` hay `NaN` trong kết quả.

### Viết lại phần Tổng kết (`src/tuvi/tongket.ts`)
- **Chân dung lá số.** Đoạn văn khái quát gồm mạng, cục, chính tinh thủ Mệnh và tính cách, cách cục đắc/phạm, phương diện mạnh/yếu, đại hạn đỉnh và trũng. Có từ khoá.
- **Biểu đồ radar 9 phương diện:** tính cách, gia đạo, phúc đức, tình duyên, con cái, sự nghiệp, tài lộc, sức khỏe, xã hội.
- **Đường đời.** Biểu đồ điểm của 12 đại hạn, đánh dấu hạn hiện tại; nhận định tiền/trung/hậu vận; chỉ ra hạn rực rỡ nhất và khó nhất (chỉ xét 18–75 tuổi).
- **Luận từng phương diện:**
  - Câu kết luận chính, có ghi kèm khi đắc cách mạnh.
  - Các đoạn văn: chính tinh theo từng lĩnh vực (sáng/hãm), cát tinh và sát tinh tọa/chiếu, Tuần Triệt, cách cục theo sách, rồi tổng hợp.
  - Danh sách "Kết luận rút ra" xếp theo độ tin cậy (*Chắc chắn* / *Rõ nét* / *Tham khảo*); mỗi kết luận có chip bằng chứng, bấm vào sẽ tô sáng sao trên lá số.
  - Lời khuyên cuối mỗi phương diện.
- **Văn mô tả 14 chính tinh** cho 5 lĩnh vực (tính cách, sự nghiệp, tài lộc, phối ngẫu, sức khỏe) và khoảng 40 phụ tinh. Viết dựa trên phần chư tinh của sách. Lưu ý: những đoạn này là văn tổng hợp, không trích nguyên văn.

## Chưa làm / còn hạn chế
- **Trang cũ `/tuvi/laso` vẫn dùng engine cũ có lỗi.** Giao diện mới ở `/`. Nên bỏ trang cũ hoặc trỏ nó sang engine mới.
- **Tổng kết đã viết thành văn,** nhưng sinh theo khuôn câu nên chưa uyển chuyển như thầy viết tay. Phần tổng hợp bằng AI vẫn đang tạm bỏ.
- **"Độ tin cậy" là quy tắc của chương trình,** không có trong sách: kết luận cùng chiều với đánh giá chung và có từ 3 dấu hiệu xác nhận, hoặc là câu phú mức mạnh nhất.
- **Điểm cung là thước đo heuristic tự đặt,** không có trong sách.
- **Một số câu phú quá mơ hồ chưa được mã hoá.** Chưa tổng hợp danh sách các câu bị bỏ.
- **Sách tự mâu thuẫn ở vài chỗ; engine chọn theo bài thơ an sao:**
  - Hồng Loan tuổi Mùi: Thân, sách in "Tý".
  - Lưu Tù tuổi Tỵ Dậu Sửu: Dậu, sách in "Sửu".
  - Cần người am hiểu xác nhận.
- **Chỉ theo một trường phái** (*Tử Vi Chính Biện*).
- **Vận hạn chưa xuống tới lưu nhật, lưu thời.**
- **Test chưa đủ:**
  - Có unit test cho an sao (9 test) và fuzz chống crash.
  - Chưa có test đối chiếu kết quả luận hạn và luận giải.
  - Chưa có test giao diện tự động.
- **Chưa lưu được lá số** (không có DB hay tài khoản). Chưa có in hoặc xuất PDF.
- **Thư mục `src/shared/tuvi/luangiai/` do một phiên khác tạo, import còn hỏng.** Đang loại khỏi build và không nằm trong commit này.
