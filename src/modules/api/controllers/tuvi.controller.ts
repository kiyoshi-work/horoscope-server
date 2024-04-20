import { Controller, Get, Render } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { diaBan, lapDiaBan } from '@/shared/tuvi/DiaBan';
import { lapThienBan } from '@/shared/tuvi/ThienBan';

@ApiTags('Tu vi')
@Controller('/tuvi')
export class TuviController {
  @Get('/laso')
  @Render('laso')
  laso() {
    const db = lapDiaBan(diaBan, 15, 9, 1998, 4, -1, true, 7);
    const thienBan = new lapThienBan(15, 9, 1998, 4, -1, 'Thu', db);
    const laso = {
      thienBan: thienBan,
      thapNhiCung: db.thapNhiCung,
    };
    // const db = lapDiaBan(diaBan, 31, 8, 1998, 11, 1, true, 7);
    // const thienBan = new lapThienBan(31, 8, 1998, 11, 1, 'Hung', db);
    // const laso = {
    //   thienBan: thienBan,
    //   thapNhiCung: db.thapNhiCung,
    // };
    return laso;
  }
}
