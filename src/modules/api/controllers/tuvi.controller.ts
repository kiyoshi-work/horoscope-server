import { Controller, Get, Query, Render } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { diaBan, lapDiaBan } from '@/shared/tuvi/DiaBan';
import { lapThienBan } from '@/shared/tuvi/ThienBan';

@ApiTags('Tu vi')
@Controller('/tuvi')
export class TuviController {
  @Get('/laso')
  @Render('laso')
  laso(
    @Query('ngay') ngay = '15',
    @Query('thang') thang = '9',
    @Query('nam') nam = '1998',
    @Query('gio') gio = '4',
    @Query('gioiTinh') gioiTinh = '-1',
    @Query('ten') ten = 'Đương số',
  ) {
    const [nn, tt, nnnn, gs, gt] = [ngay, thang, nam, gio, gioiTinh].map(Number);
    const db = lapDiaBan(diaBan, nn, tt, nnnn, gs, gt, true, 7);
    const thienBan = new lapThienBan(nn, tt, nnnn, gs, gt, ten, db);
    return { thienBan, thapNhiCung: db.thapNhiCung };
  }
}
