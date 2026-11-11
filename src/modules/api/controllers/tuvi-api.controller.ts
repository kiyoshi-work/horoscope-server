import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { xemTuVi } from '@/tuvi/index';

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
}
