import { diaBan, lapDiaBan } from './DiaBan';
import { lapThienBan } from './ThienBan';
import fs from 'fs';

(() => {
  // const db = lapDiaBan(diaBan, 15, 9, 1998, 4,
  //   -1, true, 7)
  // const thienBan = new lapThienBan(15, 9, 1998, 4, -1, 'Thu', db)
  // const laso = {
  //   'thienBan': thienBan,
  //   'thapNhiCung': db.thapNhiCung
  // }
  // fs.writeFile('thu.json', JSON.stringify(laso, null, 2), (err) => {
  //   if (err) {
  //     console.log('Error writing file:', err);
  //   } else {
  //     console.log('Successfully wrote file');
  //   }
  // });

  const db = lapDiaBan(diaBan, 31, 8, 1998, 11, 1, true, 7);
  const thienBan = new lapThienBan(31, 8, 1998, 11, 1, 'Hung', db);
  const laso = {
    thienBan: thienBan,
    thapNhiCung: db.thapNhiCung,
  };
  fs.writeFile('outputs/me.json', JSON.stringify(laso, null, 2), (err) => {
    if (err) {
      console.log('Error writing file:', err);
    } else {``
      console.log('Successfully wrote file');
    }
  });
})();
