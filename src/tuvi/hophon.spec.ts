import { xemHopHon } from './index';
import { _test } from './hophon';

describe('Xem hợp hôn', () => {
  const nam = { ten: 'An', gioiTinh: 'nam' as const, ngay: 31, thang: 8, nam: 1998, gio: 11 };
  const nu = { ten: 'Bình', gioiTinh: 'nu' as const, ngay: 12, thang: 3, nam: 2000, gio: 5 };
  const r = xemHopHon(nam, nu, 2026).hopHon;

  it('có đủ 5 lớp, điểm trong 0..100, trọng số cộng lại bằng 1', () => {
    expect(r.lop.map((l) => l.key)).toEqual(['tuoi', 'phu-the', 'chong-la-so', 'tu-hoa', 'bo-sung']);
    expect(r.lop.reduce((s, l) => s + l.trongSo, 0)).toBeCloseTo(1);
    for (const l of r.lop) expect(l.diem).toBeGreaterThanOrEqual(0);
    expect(r.diem).toBeLessThanOrEqual(100);
  });

  it('Tứ Hóa giao thoa: can Mậu (An) hóa Kỵ ở Thiên Cơ, đặt lên lá số Bình', () => {
    const ky = r.lop.find((l) => l.key === 'tu-hoa').muc.find((m) => m.tieuDe.startsWith('Hóa Kỵ của An'));
    expect(ky.noiDung).toContain('Thiên Cơ');
    expect(ky.danhGia).toBe('hung');
    // dấu chồng lá số trên lá số nữ có Kỵ ở đúng sao Thiên Cơ
    expect(r.chong.nu.some((d) => d.id === 'thien-co' && d.nhan === 'Kỵ')).toBe(true);
  });

  it('Tuổi: Mậu Dần – Canh Thìn không hợp không xung; nạp âm Thổ sinh Kim', () => {
    const t = r.lop[0].muc.map((m) => m.tieuDe);
    expect(t).toContain('Chi bình hòa');
    expect(t).toContain('Nạp âm Thổ – Kim');
  });

  it('Chi lục xung, lục hợp nhận diện đúng', () => {
    const kq = (y1: number, y2: number) => xemHopHon({ ...nam, nam: y1 }, { ...nu, nam: y2 }, 2026).hopHon.lop[0].muc.map((m) => m.tieuDe);
    expect(kq(1990, 1996)).toContain('Chi lục xung'); // Ngọ – Tý
    expect(kq(1997, 1996)).toContain('Chi lục hợp'); // Sửu – Tý
  });

  it('nhóm chính tinh', () => {
    expect(_test.nhomCua('that-sat')[0]).toBe('sat-pha-liem-tham');
    expect(_test.nhomCua('cu-mon')[0]).toBe('cu-nhat');
  });
});
