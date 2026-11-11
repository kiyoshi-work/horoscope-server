import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ChartInput, xemHopHon, xemTuVi } from '@/tuvi/index';

@ApiTags('Tu vi')
@Controller('/api/tuvi')
export class TuviApiController {
  @Get('/laso')
  @ApiQuery({ name: 'ngay', example: 31 })
  @ApiQuery({ name: 'thang', example: 8 })
  @ApiQuery({ name: 'nam', example: 1998 })
  @ApiQuery({ name: 'gio', description: 'Chi giờ sinh 1=Tý … 12=Hợi', example: 11 })
  @ApiQuery({ name: 'gioiTinh', enum: ['nam', 'nu'] })
  @ApiQuery({ name: 'lich', enum: ['duong', 'am'], required: false })
  @ApiQuery({ name: 'thangNhuan', required: false })
  @ApiQuery({ name: 'cachTinhNhuan', enum: ['giu', 'tach'], required: false })
  @ApiQuery({ name: 'namXem', required: false })
  @ApiQuery({ name: 'ten', required: false })
  laso(@Query() q: Record<string, string>) {
    const num = (k: string) => {
      const v = Number(q[k]);
      if (!Number.isFinite(v)) throw new BadRequestException(`Thiếu hoặc sai tham số ${k}`);
      return v;
    };
    try {
      return xemTuVi(
        {
          ten: q.ten,
          ngay: num('ngay'),
          thang: num('thang'),
          nam: num('nam'),
          gio: num('gio'),
          gioiTinh: q.gioiTinh === 'nu' ? 'nu' : 'nam',
          lich: q.lich === 'am' ? 'am' : 'duong',
          thangNhuan: q.thangNhuan === '1' || q.thangNhuan === 'true',
          cachTinhNhuan: q.cachTinhNhuan === 'tach' ? 'tach' : 'giu',
        },
        q.namXem ? num('namXem') : new Date().getFullYear(),
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('/hophon')
  @ApiQuery({ name: 'a_ngay', description: 'Người nam: ngày sinh. Các tham số a_* (nam) và b_* (nữ): ngay, thang, nam, gio, lich, thangNhuan, ten', example: 31 })
  @ApiQuery({ name: 'a_thang', example: 8 })
  @ApiQuery({ name: 'a_nam', example: 1998 })
  @ApiQuery({ name: 'a_gio', example: 11 })
  @ApiQuery({ name: 'b_ngay', example: 12 })
  @ApiQuery({ name: 'b_thang', example: 3 })
  @ApiQuery({ name: 'b_nam', example: 2000 })
  @ApiQuery({ name: 'b_gio', example: 5 })
  @ApiQuery({ name: 'namXem', required: false })
  hophon(@Query() q: Record<string, string>) {
    const input = (p: 'a' | 'b'): ChartInput => {
      const num = (k: string) => {
        const v = Number(q[`${p}_${k}`]);
        if (!q[`${p}_${k}`] || !Number.isFinite(v)) throw new BadRequestException(`Thiếu hoặc sai tham số ${p}_${k}`);
        return v;
      };
      return {
        ten: q[`${p}_ten`],
        ngay: num('ngay'), thang: num('thang'), nam: num('nam'), gio: num('gio'),
        gioiTinh: p === 'a' ? 'nam' : 'nu',
        lich: q[`${p}_lich`] === 'am' ? 'am' : 'duong',
        thangNhuan: q[`${p}_thangNhuan`] === '1',
        cachTinhNhuan: q.cachTinhNhuan === 'tach' ? 'tach' : 'giu',
      };
    };
    const a = input('a'), b = input('b');
    try {
      return xemHopHon(a, b, q.namXem ? Number(q.namXem) : new Date().getFullYear());
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
