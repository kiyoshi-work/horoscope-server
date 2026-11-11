/**
 * Tổng kết luận giải — viết thành lời như thầy Tử Vi tổng hợp sau khi đã xét từng cung:
 *  - Chân dung lá số (một đoạn khái quát + từ khoá).
 *  - Từng chủ đề: câu kết luận chính, đoạn văn diễn giải (chính tinh → cát/sát tinh hội chiếu → cách cục),
 *    các kết luận có mức độ chắc chắn (dựa trên số tín hiệu độc lập cùng chiều) kèm bằng chứng để tô sáng.
 *  - Đường đời: đại hạn đẹp nhất, khó nhất, tiền/trung/hậu vận.
 * Văn mô tả chính tinh theo từng lĩnh vực tổng hợp từ phần II sách (chư tinh) và các câu phú phần III.
 */
import { Chart, Palace, StarInChart } from './chart';
import { tamHop, xung } from './core';
import { CATALOG, KB } from './kb';
import { Hit, RuleMatch } from './rules';
import type { CungView, DaiHanView, DanhGia } from './analysis';

type Linh = 'tc' | 'sn' | 'tl' | 'pt' | 'sk';
/** [khi sáng (miếu/vượng/đắc), khi hãm/bình] */
const CT: Record<string, Record<Linh, [string, string]>> = {
  'tu-vi': {
    tc: ['đôn hậu, đường bệ, có uy, trọng danh dự và thích đứng đầu', 'tự cao, thích được tâng bốc, nhiều ý tưởng lớn nhưng thiếu người phò tá thì khó thành'],
    sn: ['có tố chất lãnh đạo, hợp vị trí quản lý, công quyền; càng có quyền càng phát', 'chí lớn nhưng thiếu thế, nên chọn môi trường ổn định và xây dựng người giúp việc'],
    tl: ['tài lộc đến từ địa vị, tiền bạc dồi dào và giữ được của', 'tiền đủ dùng nhưng hay chi theo thể diện'],
    pt: ['người phối ngẫu đứng đắn, có địa vị, gia đình nề nếp — nhưng người kia hay nắm quyền', 'người phối ngẫu tự ái cao; kết hôn muộn thì bền hơn'],
    sk: ['sức khỏe nền tốt, chỉ cần giữ tỳ vị, tiêu hóa', 'lưu ý tỳ vị, tiêu hóa, chứng đầy trướng'],
  },
  'thien-co': {
    tc: ['thông minh, nhanh nhạy, khéo tay, giỏi mưu tính và có lòng nhân hậu', 'lắm mưu vặt, hay lo nghĩ, tính khí bất định, dễ đổi ý'],
    sn: ['hợp nghề dùng trí: kỹ thuật, kế hoạch, nghiên cứu, tham mưu, cố vấn', 'hợp nghề kỹ thuật, tay nghề; hay đổi việc, khó ngồi yên một chỗ'],
    tl: ['kiếm tiền bằng trí óc, tay nghề; tiền đến đều đặn', 'tiền vào ra thất thường, nên có nghề vững trong tay'],
    pt: ['người phối ngẫu thông minh, khéo léo, kém tuổi thì càng hợp', 'vợ chồng dễ bất đồng ý kiến, nên lập gia đình muộn'],
    sk: ['lưu ý gan, thần kinh, chân tay', 'dễ suy nhược thần kinh, đau gan, tổn thương chân tay'],
  },
  'thai-duong': {
    tc: ['quang minh, hào phóng, nhiệt tình, thẳng thắn và thích danh tiếng', 'nóng nảy, nói nhiều, trọng hư danh, lao tâm khổ trí'],
    sn: ['hợp chính trị, giáo dục, công quyền, nghề cần tiếng tăm; danh vang xa', 'vất vả bôn ba, danh không xứng với công sức bỏ ra'],
    tl: ['tiền đến từ danh tiếng, chi tiêu rộng rãi', 'làm nhiều hưởng ít, dễ hao tán vì người khác'],
    pt: ['phối ngẫu sáng sủa, có danh, gia đạo hưng vượng', 'hôn nhân lận đận, dễ xa cách'],
    sk: ['lưu ý mắt, đầu, huyết áp', 'dễ bệnh về mắt, nhức đầu, huyết áp'],
  },
  'vu-khuc': {
    tc: ['cương nghị, quả quyết, thẳng thắn, giỏi tính toán và làm việc thực tế', 'cứng nhắc, cô độc, hà tiện, dễ va chạm với người'],
    sn: ['hợp tài chính, ngân hàng, kinh doanh, kỹ nghệ, quân sự', 'kinh doanh nhỏ hoặc nghề tay chân, hay gặp trở ngại giữa chừng'],
    tl: ['là tài tinh — kiếm tiền giỏi, có thể giàu lớn', 'tiền khó tụ, kiếm được phải đổi bằng nhiều vất vả'],
    pt: ['phối ngẫu giỏi giang, nắm tài chính nhưng tình cảm khô khan', 'dễ hình khắc, chia ly; lấy muộn thì đỡ'],
    sk: ['lưu ý phổi, hô hấp', 'dễ bệnh phổi, hô hấp, xương khớp'],
  },
  'thien-dong': {
    tc: ['hiền hòa, vui vẻ, dễ thích nghi, biết hưởng thụ', 'thiếu kiên định, hay thay đổi, ngại khó'],
    sn: ['hợp dịch vụ, văn hóa, công việc ổn định; trước khó sau dễ', 'hay đổi nghề, phải qua nhiều lần làm lại mới ổn'],
    tl: ['tự tay làm nên, tiền đến từ từ mà bền', 'lúc có lúc không, cần biết tích lũy'],
    pt: ['phối ngẫu hiền lành, hiểu ý, gia đình vui vẻ', 'tình cảm dễ nhạt, hay đổi ý'],
    sk: ['lưu ý thận, bàng quang', 'dễ bệnh thận, bàng quang, tiểu tiện'],
  },
  'liem-trinh': {
    tc: ['liêm chính, nghiêm túc, có nguyên tắc và cầu tiến', 'nóng nảy, cố chấp, dễ dính thị phi, kiện tụng'],
    sn: ['hợp luật pháp, quân cảnh, chính trị, quản lý kỷ luật', 'dễ vướng thị phi, nên tránh việc có rủi ro pháp lý'],
    tl: ['tiền đến từ chức vụ và uy tín', 'tiền hay phá tán, dễ mất vì tranh chấp'],
    pt: ['phối ngẫu cứng cỏi, đứng đắn', 'hôn nhân trắc trở, tình cảm phức tạp'],
    sk: ['lưu ý tim mạch, huyết', 'dễ bệnh tim mạch, máu huyết, mụn nhọt'],
  },
  'thien-phu': {
    tc: ['điềm đạm, khoan hòa, thận trọng, có tài tổ chức và quản lý', 'bảo thủ, hơi ích kỷ, thiếu quyết đoán'],
    sn: ['hợp quản lý tài sản, hành chính, kinh tế; sự nghiệp vững vàng', 'nên làm việc chắc chắn, không hợp mạo hiểm'],
    tl: ['là kho tiền — giữ của tốt, giàu bền vững', 'thu nhập ổn nhưng không lớn'],
    pt: ['phối ngẫu đảm đang, gia đình êm ấm, sung túc', 'gia đình yên nhưng ít mặn mà'],
    sk: ['sức khỏe khá, lưu ý tỳ vị', 'lưu ý tỳ vị, tiêu hóa'],
  },
  'thai-am': {
    tc: ['dịu dàng, tinh tế, giàu cảm xúc, thanh nhã', 'đa sầu, hay mơ mộng, nhút nhát, thiếu quyết đoán'],
    sn: ['hợp tài chính, bất động sản, nghệ thuật, văn chương', 'sự nghiệp lận đận, phải làm nhiều nơi'],
    tl: ['giàu điền sản, biết tích lũy, càng về sau càng khá', 'của tụ rồi tán, khó giữ lâu'],
    pt: ['phối ngẫu hiền dịu, chu đáo, tình cảm sâu đậm', 'duyên muộn, tình cảm nhiều buồn lòng'],
    sk: ['lưu ý thận, mắt, nội tiết', 'dễ bệnh thận, mắt, nội tiết, khí huyết'],
  },
  'tham-lang': {
    tc: ['đa tài, giao thiệp giỏi, tham vọng và biết hưởng thụ', 'ham mê vật chất, tửu sắc, dễ sa ngã, ăn nói khéo nhưng thiếu thật'],
    sn: ['hợp kinh doanh, ngoại giao, giải trí, quân sự; phát mạnh ở trung vận', 'nghề phiêu lưu, thăng trầm nhiều'],
    tl: ['phát tài nhanh, nhất là từ trung niên', 'được nhiều mất nhiều, dễ hao vì ăn chơi'],
    pt: ['nhiều duyên, đa tình, đời sống vợ chồng nồng nhiệt', 'tình duyên phức tạp, dễ có người thứ ba'],
    sk: ['lưu ý gan, thận', 'dễ bệnh gan, thận, sinh dục'],
  },
  'cu-mon': {
    tc: ['ăn nói giỏi, lý luận sắc bén, kỹ tính và đa nghi', 'khẩu thiệt, hay gây thị phi, bất mãn'],
    sn: ['hợp luật sư, giáo viên, truyền thông, ngoại giao — nghề dùng lời nói', 'công việc hay thị phi, dễ bị kiện cáo'],
    tl: ['kiếm tiền bằng miệng lưỡi, chuyên môn', 'tiền gắn với cạnh tranh, tranh chấp'],
    pt: ['hay cãi nhưng gắn bó', 'vợ chồng bất hòa, khẩu thiệt'],
    sk: ['lưu ý miệng, dạ dày', 'dễ bệnh dạ dày, răng miệng'],
  },
  'thien-tuong': {
    tc: ['chính trực, trọng nghĩa, thích giúp người, ăn mặc chỉnh tề', 'nhu nhược, dễ bị lợi dụng, hay nóng giận bất chợt'],
    sn: ['hợp hành chính, quản trị, ngoại giao, phục vụ cộng đồng', 'lận đận, hay phải làm việc dưới quyền người khác'],
    tl: ['tài lộc đủ đầy, có người giúp', 'tiền bạc trung bình'],
    pt: ['phối ngẫu đứng đắn, ưa nhìn, gia đình hòa thuận', 'dễ dang dở, nên tìm hiểu kỹ'],
    sk: ['lưu ý da, bàng quang', 'dễ bệnh ngoài da, bàng quang'],
  },
  'thien-luong': {
    tc: ['nhân hậu, đạo đức, già dặn, thích che chở người khác', 'lười, buông thả, ham chơi, dễ cô độc'],
    sn: ['hợp y, giáo dục, tư pháp, thanh tra, tôn giáo; được người tín nhiệm', 'bôn ba nhiều, phải dựa vào quý nhân'],
    tl: ['tiền có quý nhân giúp, gặp nạn có người cứu', 'tiền không nhiều, thường để giúp người'],
    pt: ['phối ngẫu chín chắn, lớn tuổi hơn thì hợp', 'tình cảm nhạt, dễ xa cách'],
    sk: ['là thọ tinh — sống thọ, lưu ý dạ dày', 'lưu ý dạ dày, ngực'],
  },
  'that-sat': {
    tc: ['dũng mãnh, quyết đoán, can đảm, độc lập', 'liều lĩnh, nóng nảy, cô độc'],
    sn: ['hợp quân sự, võ nghiệp, kinh doanh mạo hiểm, khai phá — lập nghiệp bằng sức', 'thăng trầm, dễ gặp tai nạn nghề nghiệp'],
    tl: ['kiếm tiền bằng sức lực, phát nhanh', 'phát nhanh tán nhanh'],
    pt: ['phối ngẫu cá tính mạnh; nên lấy muộn', 'dễ hình khắc, chia ly'],
    sk: ['lưu ý phổi, xương', 'dễ tai nạn, bệnh phổi, xương'],
  },
  'pha-quan': {
    tc: ['can đảm, phá cách, sáng tạo, thích đổi mới', 'ngang tàng, phá tán, bất mãn với hiện tại'],
    sn: ['hợp khai phá, cải cách, kỹ thuật, quân sự — làm được việc người khác không dám', 'nghề bấp bênh, phải đổi nhiều lần'],
    tl: ['tiền vào ra lớn, dám chơi dám thắng', 'phá tán, khó giữ của'],
    pt: ['hôn nhân nhiều sóng gió nhưng mãnh liệt', 'hôn nhân dễ đổ vỡ, lấy muộn thì đỡ'],
    sk: ['lưu ý khí huyết, thận', 'dễ tổn thương khí huyết, thận'],
  },
};

/** Ý nghĩa ngắn của phụ tinh trong lời luận (chung, hoặc theo lĩnh vực). */
const PHU: Record<string, { y: string; tc?: string; sn?: string; tl?: string; pt?: string; sk?: string }> = {
  'ta-phu': { y: 'có người phò trợ, được anh em bạn bè giúp sức' },
  'huu-bat': { y: 'có người phò trợ, được anh em bạn bè giúp sức' },
  'van-xuong': { y: 'thông minh, có văn tài', sn: 'lợi thi cử, giấy tờ, bằng cấp' },
  'van-khuc': { y: 'thông minh, có khiếu nghệ thuật', sn: 'lợi thi cử, giấy tờ, bằng cấp' },
  'thien-khoi': { y: 'gặp quý nhân nâng đỡ', sn: 'dễ được cất nhắc, đề bạt' },
  'thien-viet': { y: 'gặp quý nhân nâng đỡ', sn: 'dễ được cất nhắc, đề bạt' },
  'loc-ton': { y: 'tài lộc vững, biết giữ của', tc: 'cẩn trọng, tiết kiệm, giữ mình', tl: 'tiền bạc bền vững, tích lũy được', sk: 'bệnh hay kéo dài, âm ỉ' },
  'hoa-loc': { y: 'lộc đến tự nhiên', tl: 'kiếm tiền thuận lợi' },
  'hoa-quyen': { y: 'có quyền hành, nói có trọng lượng' },
  'hoa-khoa': { y: 'có danh tiếng, được tín nhiệm, gặp nạn được giải' },
  'thien-ma': { y: 'năng động, hay di chuyển, lợi xa quê lập nghiệp' },
  'long-tri': { y: 'thanh lịch, có danh' },
  'phuong-cac': { y: 'thanh lịch, có danh' },
  'thai-phu': { y: 'có danh dự, được khen thưởng' },
  'phong-cao': { y: 'có danh dự, được khen thưởng' },
  'an-quang': { y: 'được ân huệ, quý nhân' },
  'thien-quy': { y: 'được ân huệ, quý nhân' },
  'quoc-an': { y: 'có ấn tín, địa vị' },
  'thien-quan': { y: 'được phúc thần che chở' },
  'thien-phuc': { y: 'được phúc thần che chở' },
  'giai-than': { y: 'gặp nạn có người giải' },
  'thien-giai': { y: 'gặp nạn có người giải' },
  'dia-giai': { y: 'gặp nạn có người giải' },
  'thien-tho': { y: 'điềm đạm, sống thọ' },
  'thien-y': { y: 'gặp thầy gặp thuốc', sk: 'bệnh gặp thầy gặp thuốc' },
  'dao-hoa': { y: 'duyên dáng, có sức hút', tc: 'duyên dáng, đa cảm', pt: 'tình duyên đến sớm, nhiều người để ý' },
  'hong-loan': { y: 'duyên dáng, có sức hút', tc: 'duyên dáng, đa cảm', pt: 'tình duyên đến sớm, nhiều người để ý' },
  'thien-hy': { y: 'nhiều tin vui', pt: 'dễ có hỷ sự' },
  'kinh-duong': { y: 'hay cạnh tranh, va chạm', tc: 'cương cường, hiếu thắng', sk: 'dễ tai nạn, mổ xẻ' },
  'da-la': { y: 'việc hay chậm trễ, dây dưa', tc: 'lì lợm, chậm mà chắc', sk: 'bệnh dai dẳng, răng xương' },
  'hoa-tinh': { y: 'nóng vội, dễ hao tán bất ngờ', tc: 'nóng nảy, bốc đồng', sk: 'dễ sốt, bỏng, bệnh nhiệt' },
  'linh-tinh': { y: 'nóng vội, dễ hao tán bất ngờ', tc: 'nóng nảy, bốc đồng', sk: 'dễ sốt, bỏng, bệnh nhiệt' },
  'dia-khong': { y: 'thành bại thất thường, dễ mất trắng', tc: 'suy nghĩ khác người, dám liều', tl: 'tiền dễ tan như không', sk: 'bệnh đến bất ngờ, khó tìm nguyên nhân' },
  'dia-kiep': { y: 'thành bại thất thường, dễ mất trắng', tc: 'suy nghĩ khác người, dám liều', tl: 'tiền dễ tan như không', sk: 'bệnh đến bất ngờ, khó tìm nguyên nhân' },
  'hoa-ky': { y: 'hay gặp trở ngại, thị phi, lòng nhiều uẩn khúc', tc: 'hay suy tư, đa nghi, giữ trong lòng', sk: 'bệnh kín, khó chữa dứt' },
  'thien-hinh': { y: 'nghiêm khắc, kỷ luật; dễ dính pháp lý', sk: 'dễ phải mổ xẻ, dao kéo' },
  'thien-rieu': { y: 'đa tình, dễ sa đà', pt: 'dễ vướng chuyện tình cảm ngoài luồng' },
  'co-than': { y: 'tính cô độc', tc: 'thích một mình, ít cởi mở', pt: 'dễ muộn duyên, vợ chồng xa cách' },
  'qua-tu': { y: 'tính cô độc', tc: 'thích một mình, ít cởi mở', pt: 'dễ muộn duyên, vợ chồng xa cách' },
  'thien-khoc': { y: 'hay lo âu, buồn phiền' },
  'thien-hu': { y: 'hay lo âu, buồn phiền' },
  'dai-hao': { y: 'hao tán, tiêu xài lớn' },
  'tieu-hao': { y: 'hao tán vặt' },
};
const CAT_UU_TIEN = ['hoa-loc', 'hoa-quyen', 'hoa-khoa', 'loc-ton', 'ta-phu', 'huu-bat', 'van-xuong', 'van-khuc', 'thien-khoi', 'thien-viet', 'thien-ma', 'long-tri', 'phuong-cac', 'thai-phu', 'phong-cao', 'an-quang', 'thien-quy', 'quoc-an', 'thien-quan', 'thien-phuc', 'giai-than', 'thien-giai', 'dia-giai', 'thien-tho', 'thien-y', 'dao-hoa', 'hong-loan', 'thien-hy'];
const HUNG_UU_TIEN = ['dia-khong', 'dia-kiep', 'hoa-ky', 'kinh-duong', 'da-la', 'hoa-tinh', 'linh-tinh', 'thien-hinh', 'thien-rieu', 'co-than', 'qua-tu', 'thien-khoc', 'thien-hu', 'dai-hao', 'tieu-hao'];

/** Lời luận chung theo cung khi không có văn riêng cho chính tinh: [rất tốt, tốt, trung bình, kém] */
const GEN: Record<string, [string, string, string, string]> = {
  'Phụ Mẫu': ['cha mẹ có phúc, có địa vị; được hưởng phúc ấm và sự nâng đỡ của cha mẹ', 'cha mẹ hiền lành, gia đình gốc gác ổn định', 'tình cảm với cha mẹ bình thường, ít nhờ được cha mẹ', 'sớm xa cha mẹ hoặc cha mẹ vất vả; tự thân lập nghiệp'],
  'Huynh Đệ': ['anh em đông, hòa thuận và giúp đỡ lẫn nhau', 'anh em êm ấm', 'anh em mỗi người một ngả', 'anh em ít, hay bất hòa hoặc phải gánh vác cho anh em'],
  'Điền Trạch': ['nhà cửa đất đai rộng rãi, có của tổ để lại hoặc tự tạo lớn', 'có nhà cửa ổn định', 'nhà đất phải tự tạo, đến muộn', 'nhà đất hay thay đổi, khó giữ của tổ'],
  'Phúc Đức': ['phúc dày, họ hàng hưng thịnh, được tổ tiên phù hộ — gặp nạn hóa lành, sống thọ', 'phúc khá, trong họ có người thành đạt', 'phúc trung bình, mọi việc phải tự thân', 'phúc mỏng, họ hàng ly tán; nên làm việc thiện để bồi phúc'],
  'Tử Tức': ['con cái đông, hiếu thảo và thành đạt', 'con cái ngoan, có đứa khá giả', 'con cái bình thường, muộn con thì tốt', 'hiếm muộn hoặc con cái vất vả, khó dạy'],
  'Thiên Di': ['ra ngoài gặp quý nhân, đi xa lập nghiệp phát đạt', 'ra ngoài được người quý mến', 'ra ngoài bình thường, không nhờ được nhiều', 'ra ngoài hay gặp thị phi, tai nạn; nên thận trọng khi đi xa'],
  'Nô Bộc': ['bạn bè, cấp dưới tốt và hết lòng giúp đỡ', 'bạn bè khá, có người giúp', 'bạn bè bình thường', 'dễ bị bạn bè, cấp dưới phản bội hoặc lợi dụng'],
  'Tật Ách': ['ít bệnh tật, gặp nạn tai qua nạn khỏi', 'sức khỏe khá', 'sức khỏe trung bình, cần giữ gìn', 'nhiều bệnh tật hoặc dễ tai nạn; cần đặc biệt chú ý'],
};

interface ChuDeDef { key: string; tieuDe: string; icon: string; cung: string[]; linh?: Linh; capDo: [string, string, string, string, string, string]; khuyen: [string, string, string] }
const CHU_DE: ChuDeDef[] = [
  { key: 'tinh-cach', tieuDe: 'Tính cách & con người', icon: '☯', cung: ['Mệnh', 'Thân'], linh: 'tc',
    capDo: ['Người có khí chất hơn người, bản lĩnh vững vàng', 'Con người đứng đắn, có năng lực và bản lĩnh', 'Tính cách cân bằng, ưu nhiều hơn nhược', 'Tính cách hai mặt: ưu nhược đan xen', 'Tính khí khó chiều, nhiều mâu thuẫn nội tâm', 'Tính khí thất thường, cần tu dưỡng nhiều'],
    khuyen: ['Phát huy uy tín bản thân, nhận trách nhiệm lớn.', 'Biết điểm mạnh để dựa vào, biết điểm yếu để tránh.', 'Rèn tính nhẫn nại, tránh nóng vội và cố chấp; chọn bạn mà chơi.'] },
  { key: 'gia-dao', tieuDe: 'Cha mẹ, anh em, gốc gác', icon: '⌂', cung: ['Phụ Mẫu', 'Huynh Đệ'],
    capDo: ['Xuất thân tốt, gia đình là chỗ dựa vững chắc', 'Gia đình êm ấm, được nâng đỡ', 'Gia đình bình ổn', 'Tình thân bình thường, phải tự lực', 'Gia đình ít nhờ cậy, sớm tự lập', 'Gia cảnh nhiều ly tán, phải tự thân vượt khó'],
    khuyen: ['Giữ gìn hòa khí, đó là phúc lớn.', 'Năng về thăm hỏi, nhường nhịn anh em.', 'Tự lập sớm là đường đúng; giữ chữ hiếu để bồi phúc.'] },
  { key: 'phuc-duc', tieuDe: 'Phúc đức, số mệnh, thọ yểu', icon: '✿', cung: ['Phúc Đức'],
    capDo: ['Phúc dày mệnh tốt — gặp nạn hóa lành, hưởng thọ', 'Phúc khá, cuộc đời được che chở', 'Phúc trung bình, tốt xấu nhờ tự thân', 'Phúc mỏng, nhiều việc phải tự gánh', 'Phúc bạc, gặp nhiều trắc trở', 'Phúc rất mỏng — cần làm phúc để giải'],
    khuyen: ['Giữ nếp nhà, làm việc thiện để phúc còn mãi.', 'Tích đức cho con cháu, giữ tâm an.', 'Năng làm việc thiện, hướng về tâm linh, cẩn trọng mọi việc.'] },
  { key: 'tinh-duyen', tieuDe: 'Tình duyên, hôn nhân', icon: '❤', cung: ['Phu Thê'], linh: 'pt',
    capDo: ['Hôn nhân mỹ mãn, phối ngẫu là quý nhân', 'Duyên tốt, vợ chồng hòa hợp', 'Hôn nhân êm ổn, có lúc sóng gió nhỏ', 'Hôn nhân có lúc sóng gió, cần vun đắp', 'Hôn nhân trắc trở, dễ xa cách', 'Duyên phận lận đận — muộn lập gia đình mới bền'],
    khuyen: ['Trân trọng người bên cạnh, cùng nhau xây dựng.', 'Thẳng thắn trao đổi, bớt cái tôi.', 'Đừng vội vàng; kết hôn muộn và chọn người chín chắn thì bền.'] },
  { key: 'con-cai', tieuDe: 'Con cái', icon: '❀', cung: ['Tử Tức'],
    capDo: ['Con cái đông đủ, hiếu thảo, thành đạt', 'Con cái ngoan ngoãn, có đứa thành danh', 'Con cái ổn định', 'Con cái bình thường, cần quan tâm dạy dỗ', 'Muộn con hoặc con cái khó dạy', 'Hiếm muộn, đường con cái nhiều lo'],
    khuyen: ['Đầu tư giáo dục cho con là đúng.', 'Dành thời gian cho con, dạy bằng gương.', 'Kiên nhẫn; muộn con lại tốt; quan tâm sức khỏe sinh sản.'] },
  { key: 'su-nghiep', tieuDe: 'Sự nghiệp, công danh, học vấn', icon: '⚑', cung: ['Quan Lộc'], linh: 'sn',
    capDo: ['Công danh hiển đạt — có thể lên vị trí cao', 'Sự nghiệp vững vàng, thăng tiến rõ', 'Sự nghiệp ổn định, tiến dần', 'Công danh trung bình, phải bền bỉ', 'Sự nghiệp nhiều trắc trở, hay đổi hướng', 'Công danh lận đận, phải tìm nghề hợp'],
    khuyen: ['Mạnh dạn nhận vị trí lãnh đạo, xây dựng uy tín lâu dài.', 'Chọn một chuyên môn và đi sâu; kiên trì sẽ thành.', 'Học một nghề vững, tránh nhảy việc liên tục và tránh việc có rủi ro pháp lý.'] },
  { key: 'tai-loc', tieuDe: 'Tài lộc, nhà cửa', icon: '◈', cung: ['Tài Bạch', 'Điền Trạch'], linh: 'tl',
    capDo: ['Tiền tài sung túc — có thể giàu lớn', 'Tài lộc khá giả, của cải bền', 'Đủ ăn đủ tiêu, có tích lũy', 'Tài lộc trung bình, vào ra thất thường', 'Tiền khó tụ, hay hao tán', 'Tài lộc chật vật — cần giữ của thật chặt'],
    khuyen: ['Đầu tư dài hạn, có tài thì làm giàu cho người khác cùng.', 'Chi tiêu có kế hoạch, tích lũy đều.', 'Tránh đầu cơ, cho vay, bảo lãnh; giữ tiền bằng tài sản cố định.'] },
  { key: 'suc-khoe', tieuDe: 'Sức khỏe, tai họa', icon: '✚', cung: ['Tật Ách'], linh: 'sk',
    capDo: ['Thân thể khỏe mạnh, tai qua nạn khỏi', 'Sức khỏe tốt', 'Sức khỏe trung bình', 'Sức khỏe có điểm yếu cần chú ý', 'Hay ốm đau hoặc tai nạn', 'Sức khỏe yếu, nhiều tai ách'],
    khuyen: ['Giữ thói quen tốt để duy trì.', 'Khám định kỳ những bộ phận đã nêu.', 'Khám định kỳ, tránh việc nguy hiểm, cẩn thận xe cộ và dao kéo.'] },
  { key: 'quan-he', tieuDe: 'Xã hội, bạn bè, xuất ngoại', icon: '✈', cung: ['Thiên Di', 'Nô Bộc'],
    capDo: ['Ra ngoài được quý nhân phù trợ, đi xa phát đạt', 'Quan hệ rộng, nhiều người giúp', 'Quan hệ xã hội bình thường', 'Ra ngoài ít nhờ được người', 'Dễ bị lợi dụng, gặp thị phi khi ra ngoài', 'Ra ngoài nhiều rủi ro, bạn bè bất lợi'],
    khuyen: ['Mở rộng giao thiệp, đi xa để phát triển.', 'Chọn lọc bạn bè, giữ chữ tín.', 'Thận trọng khi hợp tác, không bảo lãnh, cẩn thận khi đi xa.'] },
];

// ───────────────────────────────────────────── Kiểu dữ liệu trả về
export interface BangChung { ten: string; danhGia: DanhGia; hits: Hit[]; cung: number[] }
export interface KetLuan { cau: string; danhGia: DanhGia; doTinCay: 'chac-chan' | 'cao' | 'vua'; nguon: string; bangChung: BangChung[]; trang?: number }
export interface ChuDeLuan {
  key: string; tieuDe: string; icon: string; diem: number; muc: string; danhGia: DanhGia;
  ketLuanChinh: string; doanVan: string[]; ketLuan: KetLuan[]; loiKhuyen: string;
  cung: { ten: string; chi: number; diem: number }[]; tuKhoa: string[];
}
export interface DuongDoi {
  diem: { tuTuoi: number; denTuoi: number; tuNam: number; denNam: number; diem: number; chi: number; ten: string; dangChay: boolean }[];
  dinh: string; trung: string; giaiDoan: { ten: string; danhGia: DanhGia; noiDung: string }[];
}
export interface TongKetView {
  chanDung: { tieuDe: string; doanVan: string[]; tuKhoa: string[]; manh: string[]; yeu: string[] };
  chuDe: ChuDeLuan[];
  duongDoi: DuongDoi;
}

// ───────────────────────────────────────────── Tiện ích
const sang = (s: StarInChart) => s.dacTinh === 'M' || s.dacTinh === 'V' || s.dacTinh === 'Đ';
const TEN_DAC: Record<string, string> = { M: 'miếu', V: 'vượng', Đ: 'đắc địa', B: 'bình hòa', H: 'hãm địa' };
const tenSao = (s: StarInChart) => s.ten + (s.dacTinh ? ` ${TEN_DAC[s.dacTinh]}` : '');
const chinh = (p: Palace) => p.stars.filter((s) => s.loai === 'chinh');
const lietKe = (a: string[]) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' và ' + a[a.length - 1]);
const hoaDau = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const arr = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);
/** Điểm cung (thang heuristic ≈ −10…15) → 0…100 */
export const thang100 = (d: number) => Math.max(3, Math.min(98, Math.round(50 + d * 4.2)));
const capDo = (d100: number) => (d100 >= 85 ? 0 : d100 >= 70 ? 1 : d100 >= 57 ? 2 : d100 >= 44 ? 3 : d100 >= 30 ? 4 : 5);
const MUC = ['Rất tốt', 'Tốt', 'Khá', 'Trung bình', 'Kém', 'Rất kém'];
const dgTu = (d100: number): DanhGia => (d100 >= 62 ? 'cat' : d100 < 42 ? 'hung' : 'trung');
const SAT = new Set(CATALOG.groups['luc-sat'] || []);
/** Văn ngắn của sao theo lĩnh vực */
const phuY = (id: string, linh?: Linh) => {
  const x = PHU[id];
  if (!x) return '';
  if (linh && (x as any)[linh]) return (x as any)[linh];
  if (linh === 'sk' && CATALOG.byId[id]?.nhom === 'cat') return 'giải bớt bệnh tật';
  return x.y;
};

function nhomSao(stars: StarInChart[], uuTien: string[]) {
  return uuTien.map((id) => stars.find((s) => s.id === id)).filter(Boolean) as StarInChart[];
}
/** Gom các sao có cùng ý nghĩa thành một mệnh đề: "Tả Phù, Hữu Bật (có người phò trợ…)" */
function menhDe(stars: StarInChart[], linh?: Linh): string[] {
  const by = new Map<string, string[]>();
  for (const s of stars) {
    const y = phuY(s.id, linh);
    if (!y) continue;
    by.set(y, [...(by.get(y) || []), s.ten]);
  }
  return [...by].map(([y, ten]) => `${lietKe(ten)} (${y})`);
}

// ───────────────────────────────────────────── Luận một chủ đề
function luanChuDe(def: ChuDeDef, chart: Chart, kb: KB, matches: RuleMatch[], cv: CungView[]): ChuDeLuan {
  const P = chart.palaces;
  const tb = chart.thienBan;
  const isNu = tb.gioiTinh === 'nu';
  const cungChi = def.cung
    .map((t) => (t === 'Thân' ? tb.cungThan : P.find((p) => p && p.ten === t)?.chi))
    .filter((c, i, a) => c && a.indexOf(c) === i) as number[];
  const cung = cungChi.map((chi) => ({ ten: chi === tb.cungThan && def.cung.includes('Thân') && chi !== tb.cungMenh ? 'Thân' : P[chi].ten, chi, diem: cv.find((c) => c.chi === chi)?.diem ?? 0 }));

  // luật liên quan
  const own = matches.filter((m) => {
    const ten = arr(m.rule.cung);
    return cungChi.includes(m.chi) && (ten.includes('*') || ten.some((t) => def.cung.includes(t) || t === P[m.chi].ten));
  });
  const seen = new Set<string>();
  const luat = own.filter((m) => !seen.has(m.rule.id) && seen.add(m.rule.id)).sort((a, b) => b.rule.mucDo - a.rule.mucDo);
  const net = luat.reduce((a, m) => a + (m.rule.danhGia === 'cat' ? m.rule.mucDo : m.rule.danhGia === 'hung' ? -m.rule.mucDo : 0), 0);

  // điểm: cung chính 65%, cung phụ 35%, cộng xu hướng các câu phú
  const base = cung.length > 1 ? cung[0].diem * 0.65 + (cung.slice(1).reduce((a, c) => a + c.diem, 0) / (cung.length - 1)) * 0.35 : cung[0].diem;
  const diem = thang100(base + Math.max(-4, Math.min(4, net * 0.35)));
  const cap = capDo(diem);
  const danhGia = dgTu(diem);

  const doanVan: string[] = [];
  const ketLuan: KetLuan[] = [];
  const tuKhoa: string[] = [];
  const chi0 = cungChi[0];
  const p0 = P[chi0];

  for (const chi of cungChi) {
    const p = P[chi];
    const laThan = def.cung.includes('Thân') && chi === tb.cungThan && chi !== tb.cungMenh;
    const tenCung = laThan ? 'Thân' : p.ten;
    const ct = chinh(p);
    const linh = def.linh;
    const cau: string[] = [];
    // 1. Chính tinh
    let ctXet = ct;
    if (!ct.length) {
      ctXet = chinh(P[xung(chi)]);
      cau.push(`Cung ${tenCung} tại ${p.chiTen} vô chính diệu, phải mượn ${lietKe(ctXet.map(tenSao)) || 'cung đối'} bên ${P[xung(chi)].ten} chiếu sang, nên việc của cung này phụ thuộc hoàn cảnh, kém bền và thường đến muộn`);
    } else {
      cau.push(`Cung ${tenCung} tại ${p.chiTen} có ${lietKe(ct.map(tenSao))} tọa thủ`);
    }
    if (linh) {
      for (const s of ctXet) {
        const t = CT[s.id]?.[linh];
        if (!t) continue;
        const sg = sang(s);
        const tt = sg ? 'sáng sủa' : s.dacTinh === 'B' ? 'chỉ bình hòa' : 'hãm địa';
        cau.push(linh === 'sk' ? `${s.ten} ${tt} chủ về bệnh: ${t[sg ? 0 : 1]}` : linh === 'tc' ? `${s.ten} ${tt} cho thấy người ${t[sg ? 0 : 1]}` : `${s.ten} ${tt}: ${t[sg ? 0 : 1]}`);
        ketLuan.push({
          cau: hoaDau(t[sg ? 0 : 1]) + '.', danhGia: sg ? 'cat' : 'hung', doTinCay: 'vua', nguon: `${s.ten} ${TEN_DAC[s.dacTinh] || ''} ${ct.length ? 'tọa' : 'chiếu'} ${tenCung}`,
          bangChung: [{ ten: tenSao(s), danhGia: sg ? 'cat' : 'hung', hits: [{ chi: ct.length ? chi : xung(chi), id: s.id }], cung: [chi] }],
        });
        if (linh === 'tc') {
          const info = kb.stars[s.id];
          if (info?.tuongTrung) tuKhoa.push(info.tuongTrung.replace(/\.$/, ''));
        }
      }
    } else {
      const g = GEN[p.ten];
      if (g) {
        const netCung = luat.filter((m) => m.chi === chi).reduce((a, m) => a + (m.rule.danhGia === 'cat' ? m.rule.mucDo : m.rule.danhGia === 'hung' ? -m.rule.mucDo : 0), 0);
        const d100 = thang100((cv.find((c) => c.chi === chi)?.diem ?? 0) + Math.max(-4, Math.min(4, netCung * 0.6)));
        cau.push(`Nhìn chung ${g[d100 >= 75 ? 0 : d100 >= 56 ? 1 : d100 >= 42 ? 2 : 3]}`);
      }
    }
    doanVan.push(cau.join('. ') + '.');

    // 2. Cát tinh & sát tinh (tọa + tam phương)
    const tp = [chi, xung(chi), ...tamHop(chi)];
    const toa = p.stars;
    const chieu = tp.slice(1).flatMap((c) => P[c].stars);
    const catToa = nhomSao(toa, CAT_UU_TIEN);
    const catChieu = nhomSao(chieu, CAT_UU_TIEN).filter((s) => !catToa.some((x) => x.id === s.id));
    const hungToa = nhomSao(toa, HUNG_UU_TIEN);
    const hungChieu = nhomSao(chieu, HUNG_UU_TIEN).filter((s) => SAT.has(s.id) || s.id === 'hoa-ky');
    const cauCat: string[] = [];
    if (catToa.length) cauCat.push(`Trong cung có ${menhDe(catToa, linh).join('; ')}`);
    if (catChieu.length) cauCat.push(`Tam phương được ${menhDe(catChieu.slice(0, 5), linh).join('; ')} hội chiếu`);
    if (hungToa.length) cauCat.push(`${catToa.length || catChieu.length ? 'Ngược lại, cung' : 'Cung'} có ${menhDe(hungToa, linh).join('; ')}`);
    if (hungChieu.length && !hungToa.length) cauCat.push(`Từ tam phương có ${lietKe([...new Set(hungChieu.map((s) => s.ten))])} chiếu về nên không tránh khỏi lúc trắc trở`);
    if (p.tuan || p.triet) cauCat.push(`${p.tuan && p.triet ? 'Tuần và Triệt' : p.tuan ? 'Tuần' : 'Triệt'} án ngữ làm ${ct.some(sang) ? 'cái tốt bị chiết giảm, việc thường đến chậm hoặc trắc trở lúc đầu' : 'cái xấu được giảm nhẹ'}, ảnh hưởng mạnh trước 30 tuổi`);
    if (cauCat.length) doanVan.push(cauCat.join('. ') + '.');

    // Tín hiệu từ cát/sát tinh tọa thủ (đủ mạnh mới thành kết luận)
    const satToa = toa.filter((s) => SAT.has(s.id) && s.dacTinh !== 'Đ' && s.dacTinh !== 'M' && s.dacTinh !== 'V');
    if (satToa.length >= 2) {
      ketLuan.push({ cau: `${tenCung} bị ${lietKe(satToa.map((s) => s.ten))} cùng đóng: ${phuY(satToa[0].id, linh)}, cần đề phòng nhiều.`, danhGia: 'hung', doTinCay: 'vua', nguon: `sát tinh tọa ${tenCung}`, bangChung: [{ ten: satToa.map((s) => s.ten).join(' + '), danhGia: 'hung', hits: satToa.map((s) => ({ chi, id: s.id })), cung: [chi] }] });
    }
    const hoa = toa.filter((s) => ['hoa-loc', 'hoa-quyen', 'hoa-khoa'].includes(s.id));
    if (hoa.length) {
      ketLuan.push({ cau: `Có ${lietKe(hoa.map((s) => s.ten))} tại ${tenCung}: ${lietKe(hoa.map((s) => phuY(s.id, linh)))}.`, danhGia: 'cat', doTinCay: 'vua', nguon: `Tam Hóa tại ${tenCung}`, bangChung: [{ ten: hoa.map((s) => s.ten).join(' + '), danhGia: 'cat', hits: hoa.map((s) => ({ chi, id: s.id })), cung: [chi] }] });
    }
    const ky = toa.find((s) => s.id === 'hoa-ky');
    if (ky) ketLuan.push({ cau: `Hóa Kỵ đóng ${tenCung}: ${phuY('hoa-ky')}${p.tuan || p.triet ? ' (có Tuần/Triệt nên giảm nhẹ)' : ''}.`, danhGia: 'hung', doTinCay: 'vua', nguon: `Hóa Kỵ tại ${tenCung}`, bangChung: [{ ten: 'Hóa Kỵ', danhGia: 'hung', hits: [{ chi, id: 'hoa-ky' }], cung: [chi] }] });
  }

  // 3. Cách cục & phú đoán
  const noiBat = luat.filter((m, i) => m.rule.mucDo >= 2 && luat.findIndex((x) => x.rule.ten.toLowerCase() === m.rule.ten.toLowerCase()) === i).slice(0, 4);
  if (noiBat.length) {
    const cau = noiBat.map((m) => `${m.rule.loai === 'cach-cuc' ? 'cách' : 'bộ'} “${m.rule.ten}” — ${m.rule.ketLuan.replace(/\.$/, '')}`);
    doanVan.push(`Đối chiếu sách, lá số này có ${cau.join('; ')}.`);
  }
  for (const m of luat.slice(0, 10)) {
    ketLuan.push({
      cau: m.rule.ketLuan, danhGia: m.rule.danhGia, doTinCay: m.rule.mucDo >= 3 ? 'cao' : 'vua', nguon: m.rule.ten, trang: m.rule.trang,
      bangChung: [{ ten: m.rule.ten, danhGia: m.rule.danhGia, hits: m.hits, cung: [m.chi] }],
    });
    if (m.rule.loai === 'cach-cuc' && m.rule.mucDo >= 2) tuKhoa.push(m.rule.ten);
  }

  // Độ tin cậy: kết luận cùng chiều với tổng thể chủ đề + có nhiều tín hiệu độc lập cùng chiều → chắc chắn
  const soTinHieu = { cat: ketLuan.filter((k) => k.danhGia === 'cat').length, hung: ketLuan.filter((k) => k.danhGia === 'hung').length, trung: 0 };
  const chuDao: DanhGia = danhGia !== 'trung' ? danhGia : soTinHieu.hung >= soTinHieu.cat + 2 ? 'hung' : soTinHieu.cat >= soTinHieu.hung + 2 ? 'cat' : 'trung';
  const cungChieu = (k: KetLuan) => k.danhGia === chuDao;
  for (const k of ketLuan) {
    if (k.danhGia === 'trung') continue;
    const dongThuan = soTinHieu[k.danhGia] - soTinHieu[k.danhGia === 'cat' ? 'hung' : 'cat'];
    const agree = cungChieu(k);
    const strong = k.doTinCay === 'cao';
    // "Chắc chắn" chỉ khi cùng chiều với đánh giá chung (không phải chỉ nghiêng) và có nhiều tín hiệu xác nhận
    k.doTinCay = agree && k.danhGia === danhGia && (strong || dongThuan >= 3) ? 'chac-chan' : agree || strong ? 'cao' : 'vua';
  }
  const thuTu = { 'chac-chan': 0, cao: 1, vua: 2 };
  const daCo = new Set<string>();
  const kl = ketLuan
    .filter((k) => !daCo.has(k.cau) && daCo.add(k.cau))
    .sort((a, b) => thuTu[a.doTinCay] - thuTu[b.doTinCay] || (a.danhGia === chuDao ? -1 : 1))
    .slice(0, 7);

  // Câu kết luận chính
  let ketLuanChinh = def.capDo[cap];
  const cachManh = luat.find((m) => m.rule.loai === 'cach-cuc' && m.rule.mucDo === 3 && m.rule.danhGia === danhGia);
  if (cachManh) ketLuanChinh += ` — đắc cách “${cachManh.rule.ten}”`;
  else if (danhGia === 'trung' && chuDao === 'hung') ketLuanChinh += ', nhưng có điều phải lưu tâm';
  else if (danhGia === 'trung' && chuDao === 'cat') ketLuanChinh += ', lại có điểm sáng';
  if (def.key === 'tinh-duyen' && isNu) ketLuanChinh = ketLuanChinh.replace('phối ngẫu', 'người chồng');
  const doanTong = `Tổng hợp lại, ${def.tieuDe.toLowerCase()} ở mức ${MUC[cap].toLowerCase()} (${diem}/100). ${danhGia === 'cat' ? 'Các tín hiệu tốt chiếm ưu thế rõ rệt' : danhGia === 'hung' ? 'Các tín hiệu xấu chiếm ưu thế' : chuDao === 'hung' ? 'Tốt xấu đan xen nhưng nghiêng về bất lợi' : chuDao === 'cat' ? 'Tốt xấu đan xen nhưng nghiêng về thuận lợi' : 'Tốt xấu đan xen'}: ${soTinHieu.cat} dấu hiệu tốt, ${soTinHieu.hung} dấu hiệu xấu từ sao, cung và cách cục.`;
  doanVan.push(doanTong);

  return {
    key: def.key, tieuDe: def.tieuDe, icon: def.icon, diem, muc: MUC[cap], danhGia, ketLuanChinh,
    doanVan, ketLuan: kl, loiKhuyen: def.khuyen[danhGia === 'cat' ? 0 : danhGia === 'trung' ? 1 : 2],
    cung, tuKhoa: [...new Set(tuKhoa)].slice(0, 6),
  };
}

// ───────────────────────────────────────────── Đường đời
function duongDoi(chart: Chart, dh: DaiHanView[]): DuongDoi {
  const diem = dh.map((d) => ({ tuTuoi: d.tuTuoi, denTuoi: d.denTuoi, tuNam: d.tuNam, denNam: d.denNam, diem: thang100(d.diem), chi: d.chi, ten: d.ten, dangChay: d.dangChay }));
  const songDen = diem.filter((d) => d.denTuoi >= 18 && d.tuTuoi <= 75);
  const dinhP = songDen.reduce((a, b) => (b.diem > a.diem ? b : a));
  const trungP = songDen.reduce((a, b) => (b.diem < a.diem ? b : a));
  const ct = (chi: number) => lietKe(chinh(chart.palaces[chi]).map(tenSao)) || 'vô chính diệu';
  const tb = (a: typeof diem) => (a.length ? Math.round(a.reduce((x, y) => x + y.diem, 0) / a.length) : 50);
  const tien = diem.filter((d) => d.denTuoi <= 32);
  const trung = diem.filter((d) => d.tuTuoi > 22 && d.tuTuoi <= 52);
  const hau = diem.filter((d) => d.tuTuoi > 52 && d.tuTuoi <= 85);
  const loi = (x: number) => (x >= 62 ? 'thuận lợi, nhiều cơ hội' : x >= 48 ? 'bình ổn, có lên có xuống' : 'vất vả, phải nỗ lực nhiều');
  const giaiDoan = [
    { ten: 'Tiền vận (đến ~30 tuổi)', d: tb(tien) },
    { ten: 'Trung vận (~30–55 tuổi)', d: tb(trung) },
    { ten: 'Hậu vận (sau 55 tuổi)', d: tb(hau) },
  ].map((g) => ({ ten: g.ten, danhGia: dgTu(g.d), noiDung: `${hoaDau(loi(g.d))} (${g.d}/100).` }));
  return {
    diem,
    dinh: `Rực rỡ nhất là đại hạn ${dinhP.tuTuoi}–${dinhP.denTuoi} tuổi (${dinhP.tuNam}–${dinhP.denNam}), hạn đi vào cung ${dinhP.ten} có ${ct(dinhP.chi)} — thời điểm nên dồn sức cho những việc lớn.`,
    trung: `Khó khăn nhất là đại hạn ${trungP.tuTuoi}–${trungP.denTuoi} tuổi (${trungP.tuNam}–${trungP.denNam}), hạn vào cung ${trungP.ten} có ${ct(trungP.chi)} — nên giữ mình, tránh mạo hiểm.`,
    giaiDoan,
  };
}

// ───────────────────────────────────────────── Chân dung lá số
function chanDung(chart: Chart, kb: KB, chuDe: ChuDeLuan[], matches: RuleMatch[], dd: DuongDoi): TongKetView['chanDung'] {
  const tb = chart.thienBan;
  const P = chart.palaces;
  const menh = P[tb.cungMenh];
  const ct = chinh(menh);
  const ctXet = ct.length ? ct : chinh(P[xung(tb.cungMenh)]);
  const tc = chuDe.find((c) => c.key === 'tinh-cach');
  const xep = [...chuDe].sort((a, b) => b.diem - a.diem);
  const manh = xep.filter((c) => c.diem >= 57).slice(0, 3);
  const yeu = xep.filter((c) => c.diem < 50).reverse().slice(0, 3);
  const cach = matches.filter((m) => m.rule.loai === 'cach-cuc' && m.rule.mucDo >= 2 && arr(m.rule.cung).some((c) => c === 'Mệnh' || c === 'Thân'))
    .sort((a, b) => b.rule.mucDo - a.rule.mucDo);
  const uniqTen = (a: RuleMatch[]) => a.filter((m, i) => a.findIndex((x) => x.rule.ten.toLowerCase() === m.rule.ten.toLowerCase()) === i);
  const catCach = uniqTen(cach.filter((m) => m.rule.danhGia === 'cat')).slice(0, 2);
  const hungCach = uniqTen(cach.filter((m) => m.rule.danhGia === 'hung')).slice(0, 2);

  const doan: string[] = [];
  const nguoi = tb.gioiTinh === 'nam' ? 'nam' : 'nữ';
  const sao = ctXet.map((s) => {
    const info = kb.stars[s.id];
    return `${tenSao(s)}${info?.tinhCach ? ` (${info.tinhCach.replace(/\.$/, '').toLowerCase()})` : ''}`;
  });
  doan.push(`Đương số ${nguoi} mạng ${tb.menh.napAm} (${tb.menh.hanh}), ${tb.cuc.ten}, Mệnh an tại ${menh.chiTen}${ct.length ? ` có ${lietKe(sao)}` : ` vô chính diệu, mượn ${lietKe(sao)}`}${tb.cungThan !== tb.cungMenh ? `, Thân cư ${tb.thanCu}` : ', Mệnh Thân đồng cung'}. ${tc ? `Về con người: ${tc.ketLuanChinh.toLowerCase()}.` : ''}`);
  if (catCach.length || hungCach.length) {
    const s: string[] = [];
    if (catCach.length) s.push(`đắc ${lietKe(catCach.map((m) => `cách “${m.rule.ten}”`))} — ${catCach[0].rule.ketLuan.replace(/\.$/, '')}`);
    if (hungCach.length) s.push(`${catCach.length ? 'song ' : ''}phạm ${lietKe(hungCach.map((m) => `“${m.rule.ten}”`))} — ${hungCach[0].rule.ketLuan.replace(/\.$/, '')}`);
    doan.push(`Về cách cục, Mệnh ${s.join('; ')}.`);
  }
  if (manh.length) doan.push(`Điểm sáng nhất của lá số nằm ở ${lietKe(manh.map((c) => c.tieuDe.toLowerCase()))}${yeu.length ? `; cần đặc biệt lưu tâm ${lietKe(yeu.map((c) => c.tieuDe.toLowerCase()))}` : ''}.`);
  else if (yeu.length) doan.push(`Lá số không có mặt nào thật nổi trội; cần đặc biệt lưu tâm ${lietKe(yeu.map((c) => c.tieuDe.toLowerCase()))}.`);
  doan.push(`${dd.dinh} ${dd.trung}`);

  const avg = Math.round(chuDe.reduce((a, c) => a + c.diem, 0) / chuDe.length);
  const tieuDe = avg >= 66 ? 'Lá số tốt đẹp, phú quý có phần' : avg >= 56 ? 'Lá số khá, tự thân lập nghiệp mà thành' : avg >= 46 ? 'Lá số trung bình, thành bại do mình' : 'Lá số nhiều thử thách, càng vượt khó càng vững';
  const tuKhoa = [...new Set([...(tc?.tuKhoa || []), ...catCach.map((m) => m.rule.ten)])].slice(0, 8);
  return { tieuDe, doanVan: doan, tuKhoa, manh: manh.map((c) => c.key), yeu: yeu.map((c) => c.key) };
}

export function tongKetLuan(chart: Chart, kb: KB, matches: RuleMatch[], cv: CungView[], dh: DaiHanView[]): TongKetView {
  const chuDe = CHU_DE.map((d) => luanChuDe(d, chart, kb, matches, cv));
  const dd = duongDoi(chart, dh);
  return { chanDung: chanDung(chart, kb, chuDe, matches, dd), chuDe, duongDoi: dd };
}
