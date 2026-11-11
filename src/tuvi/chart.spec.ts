import { lapLaSo } from './chart';
import { tinhLuuNien } from './han';
import { CHI } from './core';

const at = (c: ReturnType<typeof lapLaSo>, id: string) => CHI[c.palaces.find((p) => p && p.stars.some((s) => s.id === id)).chi];

describe('Lập lá số theo Tử Vi Chính Biện', () => {
  // Ví dụ trong sách (tr.10-12): Kỷ Mùi, tháng 5 ngày 12 giờ Dần → Mệnh Thìn, Mộc tam cục, Tử Vi Tỵ
  const book = lapLaSo({ lich: 'am', ngay: 12, thang: 5, nam: 1979, gio: 3, gioiTinh: 'nam' });
  it('an Mệnh, Cục, Tử Vi đúng ví dụ sách', () => {
    expect(CHI[book.thienBan.cungMenh]).toBe('Thìn');
    expect(book.thienBan.cuc.ten).toBe('Mộc tam cục');
    expect(book.thienBan.menh.hanh).toBe('Hỏa'); // Kỷ Mùi: Thiên Thượng Hỏa
    expect(at(book, 'tu-vi')).toBe('Tỵ');
    expect(at(book, 'thien-co')).toBe('Thìn');
  });
  it('các ví dụ an sao theo tuổi Mùi trong sách', () => {
    expect(at(book, 'thai-tue')).toBe('Mùi');
    expect(at(book, 'thien-khong')).toBe('Thân');
    // Bài thơ: Mão gọi Tý, nghịch đến năm sinh → tuổi Mùi ở Thân (ví dụ in trong sách ghi "Tý" là lỗi in)
    expect(at(book, 'hong-loan')).toBe('Thân');
    expect(at(book, 'thien-hy')).toBe('Dần');
    expect(at(book, 'thien-duc')).toBe('Thìn');
    expect(at(book, 'nguyet-duc')).toBe('Tý');
    expect(at(book, 'thien-tai')).toBe('Hợi'); // Mệnh Thìn, tuổi Mùi
    expect(at(book, 'thien-kho')).toBe('Tuất'); // tháng 5
    expect(at(book, 'thien-giai')).toBe('Tý');
    expect(at(book, 'dia-giai')).toBe('Hợi');
    expect(at(book, 'dia-kiep')).toBe('Sửu'); // giờ Dần
    expect(at(book, 'dia-khong')).toBe('Dậu');
    expect(at(book, 'loc-ton')).toBe('Ngọ'); // Kỷ
    expect(at(book, 'kinh-duong')).toBe('Mùi');
    expect(at(book, 'da-la')).toBe('Tỵ');
    expect(at(book, 'thien-khoi')).toBe('Tý');
    expect(at(book, 'thien-viet')).toBe('Thân');
  });
  it('Triệt / Tuần tuổi Kỷ Mùi', () => {
    expect(book.palaces.filter((p) => p?.triet).map((p) => p.chiTen)).toEqual(['Thân', 'Dậu']);
    // Kỷ Mùi thuộc con Giáp Dần → Tuần ở Tý Sửu
    expect(book.palaces.filter((p) => p?.tuan).map((p) => p.chiTen)).toEqual(['Tý', 'Sửu']);
  });

  const c = lapLaSo({ ngay: 31, thang: 8, nam: 1998, gio: 11, gioiTinh: 'nam' });
  it('đổi lịch, can chi', () => {
    expect(c.thienBan.amLich).toMatchObject({ ngay: 10, thang: 7, nam: 1998 });
    expect(c.thienBan.canChi.nam).toBe('Mậu Dần');
    expect(c.thienBan.cuc.ten).toBe('Thủy nhị cục');
    expect(CHI[c.thienBan.cungMenh]).toBe('Tuất');
    expect(c.thienBan.thanCu).toBe('Tài Bạch');
  });
  it('vòng Tràng Sinh: Thai trước Dưỡng', () => {
    expect(at(c, 'trang-sinh')).toBe('Thân');
    expect(at(c, 'tuyet')).toBe('Tỵ');
    expect(at(c, 'thai')).toBe('Ngọ');
    expect(at(c, 'duong')).toBe('Mùi');
  });
  it('Hỏa Linh, Phá Toái, Cô Quả tuổi Dần', () => {
    expect(at(c, 'hoa-tinh')).toBe('Hợi');
    expect(at(c, 'linh-tinh')).toBe('Tỵ');
    expect(at(c, 'pha-toai')).toBe('Dậu');
    expect(at(c, 'co-than')).toBe('Tỵ');
    expect(at(c, 'qua-tu')).toBe('Sửu');
  });
  it('tìm Cục đúng khi Mệnh ở Tý (lỗi số dư âm của bản cũ)', () => {
    // Giáp năm: cung Tý mang can Bính → Bính Tý Giản Hạ Thủy → Thủy nhị cục
    const x = lapLaSo({ lich: 'am', ngay: 1, thang: 11, nam: 1984, gio: 1, gioiTinh: 'nam' });
    expect(CHI[x.thienBan.cungMenh]).toBe('Tý');
    expect(x.thienBan.cuc.ten).toBe('Thủy nhị cục');
  });
  it('lưu niên: Lộc Tồn, Kình, Đà lưu năm Canh Tuất (ví dụ sách tr.135)', () => {
    const l = tinhLuuNien(c, 2030);
    expect(l.canChi).toBe('Canh Tuất');
    const where = (id: string) => CHI[+Object.entries(l.luuSao).find(([, ss]) => ss.some((s) => s.id === id))[0]];
    expect(where('luu-loc-ton')).toBe('Thân');
    expect(where('luu-kinh-duong')).toBe('Dậu');
    expect(where('luu-da-la')).toBe('Mùi');
    expect(where('luu-tang-mon')).toBe('Tý');
    expect(where('luu-bach-ho')).toBe('Ngọ');
  });
  it('lưu nguyệt: sinh tháng 4 giờ Sửu, năm Tuất', () => {
    const y = lapLaSo({ lich: 'am', ngay: 5, thang: 4, nam: 1990, gio: 2, gioiTinh: 'nu' });
    const l = tinhLuuNien(y, 2030);
    expect(CHI[l.luuNguyet[0].chi]).toBe('Thân');
  });
});
