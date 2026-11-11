export function jdFromDate(dd: number, mm: number, yy: number): number {
  /**
   * Compute the (integral) Julian day number of
   * day dd/mm/yyyy, i.e., the number of days between 1/1/4713 BC
   * (Julian calendar) and dd/mm/yyyy.
   */
  let a = Math.floor((14 - mm) / 12);
  let y = yy + 4800 - a;
  let m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}
export function jdToDate(jd: number): [number, number, number] {
  /**
   * Convert a Julian day number to day/month/year.
   * @param jd - an integer Julian day number.
   * @returns an array with [day, month, year].
   */
  let a, b, c;
  if (jd > 2299160) {
    // After 5/10/1582, Gregorian calendar
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  let d = Math.floor((4 * c + 3) / 1461);
  let e = c - Math.floor((1461 * d) / 4);
  let m = Math.floor((5 * e + 2) / 153);
  let day = e - Math.floor((153 * m + 2) / 5) + 1;
  let month = m + 3 - 12 * Math.floor(m / 10);
  let year = b * 100 + d - 4800 + Math.floor(m / 10);
  return [day, month, year];
}

export function NewMoon(k: number): number {
  /**
   * Compute the time of the k-th new moon after
   * the new moon of 1/1/1900 13:52 UCT (measured as the number of
   * days since 1/1/4713 BC noon UCT, e.g., 2451545.125 is 1/1/2000 15:00 UTC.
   * Returns a floating number, e.g., 2415079.9758617813 for k=2 or
   * 2414961.935157746 for k=-2.
   */
  // Time in Julian centuries from 1900 January 0.5
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  // Mean new moon
  let M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  // Sun's mean anomaly
  let Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  // Moon's mean anomaly
  let F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  // Moon's argument of latitude
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return JdNew;
}

export function SunLongitude(jdn) {
  /**
   * Compute the longitude of the sun at any time.
   * Parameter: floating number jdn, the number of days since 1/1/4713 BC noon.
   */
  let T = (jdn - 2451545.0) / 36525;
  // Time in Julian centuries from 2000-01-01 12:00:00 GMT
  let T2 = T * T;
  let dr = Math.PI / 180; // degree to radian
  let M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  // mean anomaly, degree
  let L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  // mean longitude, degree
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  let L = L0 + DL; // true longitude, degree
  L = L * dr;
  L = L - 2 * Math.PI * (Math.floor(L / (2 * Math.PI)));
  // Normalize to (0, 2*Math.PI)
  return L;
}

export function getSunLongitude_OLD(dayNumber, timeZone) {
  /**
   * Compute sun position at midnight of the day with the given Julian day number.
   * The time zone if the time difference between local time, UTC: 7.0 for UTC+7:00
   *
   * The export function returns a number between 0 and 11. From the day after March
   * equinox and the 1st major term after March equinox, 0 is returned.
   * After that, return 1, 2, 3 ...
   */
  return Math.floor(SunLongitude(dayNumber - 0.5 - timeZone / 24) / Math.PI * 6);
}

export function getSunLongitude(jdn, timeZone) {
  let T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  let T2 = T ** 2;
  let dr = Math.PI / 180;
  let M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  let L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  let omega = 125.04 - 1934.136 * T;
  L = L - 0.00569 - 0.00478 * Math.sin(omega * dr);
  L = L * dr;
  L = L - 2 * Math.PI * Math.floor(L / (2 * Math.PI));
  return Math.floor(L / Math.PI * 6);
}

export function getNewMoonDay(k: number, timeZone: number): number {
  /**
   * Compute the day of the k-th new moon in the given time zone.
   * The time zone if the time difference between local time and UTC: 7.0 for UTC+7:00.
   */
  return Math.floor(NewMoon(k) + 0.5 + timeZone / 24);
}

export function getLunarMonth11(yy: number, timeZone: number): number {
  /**
   * Find the day that starts the luner month 11 of the given year for the given time zone.
   */
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  // sun longitude at local midnight
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

export function getLeapMonthOffset(a11: number, timeZone: number): number {
  /**
   * Find the index of the leap month after the month starting on the day a11.
   */
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1; // start with month following lunar month 11
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  while (true) {
    last = arc;
    i += 1;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    if (!(arc !== last && i < 14)) {
      break;
    }
  }
  return i - 1;
}

export function S2L(dd: number, mm: number, yy: number, timeZone: number = 7): [number, number, number, number] {
  let dayNumber, k, monthStart, a11, b11, lunarYear, lunarDay, diff, lunarLeap, lunarMonth;
  dayNumber = jdFromDate(dd, mm, yy);
  k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  a11 = getLunarMonth11(yy, timeZone);
  b11 = a11;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  lunarDay = dayNumber - monthStart + 1;
  diff = Math.floor((monthStart - a11) / 29);
  lunarLeap = 0;
  lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    let leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = 1;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

export function L2S(lunarD: number, lunarM: number, lunarY: number, lunarLeap: number | boolean, tZ: number = 7): [number, number, number] {
  let a11, b11, k, off, monthStart;
  if (lunarM < 11) {
    a11 = getLunarMonth11(lunarY - 1, tZ);
    b11 = getLunarMonth11(lunarY, tZ);
  } else {
    a11 = getLunarMonth11(lunarY, tZ);
    b11 = getLunarMonth11(lunarY + 1, tZ);
  }
  k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  off = lunarM - 11;
  if (off < 0) {
    off += 12;
  }
  if (b11 - a11 > 365) {
    let leapOff = getLeapMonthOffset(a11, tZ);
    let leapM = leapOff - 2;
    if (leapM < 0) {
      leapM += 12;
    }
    if (Number(lunarLeap) !== 0 && lunarM !== leapM) {
      return [0, 0, 0];
    } else if (Number(lunarLeap) !== 0 || off >= leapOff) {
      off += 1;
    }
  }
  monthStart = getNewMoonDay(k + off, tZ);
  return jdToDate(monthStart + lunarD - 1);
}

