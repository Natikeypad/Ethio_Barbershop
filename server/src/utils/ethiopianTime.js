import { EthDateTime } from 'ethiopian-calendar-date-converter';

/**
 * Fallback converter for Gregorian to Ethiopian date
 * Used if library encounters edge cases or invalid inputs.
 */
function fallbackGregorianToEthiopian(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  // Ethiopian calendar year difference is 7 or 8 years
  let ethYear = year - 8;
  const isGregorianLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const newYearDay = isGregorianLeap ? 12 : 11;

  // Approximate day of year
  const startOfYear = new Date(year, 0, 1);
  const diffDays = Math.floor((d - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
  const newYearDayOfYear = isGregorianLeap ? 256 : 255;

  let ethMonth = 1;
  let ethDay = 1;

  if (diffDays >= newYearDayOfYear) {
    ethYear = year - 7;
    const daysSinceNewYear = diffDays - newYearDayOfYear;
    ethMonth = Math.floor(daysSinceNewYear / 30) + 1;
    ethDay = (daysSinceNewYear % 30) + 1;
  } else {
    ethYear = year - 8;
    const daysSincePrevNewYear = diffDays + (365 - (newYearDayOfYear - (isGregorianLeap ? 1 : 0)));
    ethMonth = Math.floor(daysSincePrevNewYear / 30) + 1;
    ethDay = (daysSincePrevNewYear % 30) + 1;
  }

  if (ethMonth > 13) ethMonth = 13;
  return { year: ethYear, month: ethMonth, day: ethDay };
}

/**
 * Converts a Gregorian Date to Ethiopian Date { year, month, day }
 * @param {Date|string|number} gregorianDate
 * @returns {{ year: number, month: number, day: number }}
 */
export function toEthiopianDate(gregorianDate) {
  const dateObj = gregorianDate instanceof Date ? gregorianDate : new Date(gregorianDate);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid Gregorian date provided to toEthiopianDate');
  }

  try {
    const eth = EthDateTime.fromEuropeanDate(dateObj);
    return {
      year: Number(eth.year),
      month: Number(eth.month),
      day: Number(eth.date),
    };
  } catch (error) {
    return fallbackGregorianToEthiopian(dateObj);
  }
}

/**
 * Converts Ethiopian Date { year, month, day } to a JavaScript Date (Gregorian)
 * @param {number} ethYear
 * @param {number} ethMonth
 * @param {number} ethDay
 * @returns {Date}
 */
export function toGregorianDate(ethYear, ethMonth, ethDay) {
  const y = Number(ethYear);
  const m = Number(ethMonth);
  const d = Number(ethDay);

  try {
    const eth = new EthDateTime(y, m, d);
    return eth.toEuropeanDate();
  } catch (error) {
    // Basic fallback: Gregorian year is approximately ethYear + 7 or 8
    const approxYear = y + 7;
    return new Date(approxYear, m - 1, d);
  }
}

/**
 * Returns a formatted Ethiopian date string like "13/02/2019" (DD/MM/YYYY)
 * @param {Date|string|number} gregorianDate
 * @returns {string} Formatted string "DD/MM/YYYY"
 */
export function getEthiopianDateString(gregorianDate) {
  const { year, month, day } = toEthiopianDate(gregorianDate);
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const yyyy = String(year);
  return `${dd}/${mm}/${yyyy}`;
}
