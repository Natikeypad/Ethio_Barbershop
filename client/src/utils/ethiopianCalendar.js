/**
 * Ethiopian Calendar Utility
 * Wrapper around ethiopian-calendar-date-converter v2.x
 * API: EthDateTime.fromEuropeanDate(date) → { year, month, date, hour, minute, second }
 */

import { EthDateTime } from 'ethiopian-calendar-date-converter';

export const ETHIOPIAN_MONTHS = [
  'መስከረም', // 1. Meskerem (Sep - Oct)
  'ጥቅምት',  // 2. Tikimt (Oct - Nov)
  'ኅዳር',    // 3. Hidar (Nov - Dec)
  'ታኅሣሥ',   // 4. Tahsas (Dec - Jan)
  'ጥር',     // 5. Tir (Jan - Feb)
  'የካቲት',   // 6. Yekatit (Feb - Mar)
  'መጋቢት',  // 7. Megabit (Mar - Apr)
  'ሚያዝያ',   // 8. Miyazya (Apr - May)
  'ግንቦት',   // 9. Ginbot (May - Jun)
  'ሰኔ',      // 10. Sene (Jun - Jul)
  'ሐምሌ',    // 11. Hamle (Jul - Aug)
  'ነሐሴ',    // 12. Nehase (Aug - Sep)
  'ጳጉሜን'    // 13. Pagume (Sep)
];

/**
 * Returns the Amharic name for a given Ethiopian month number (1 to 13)
 * @param {number} monthNumber 1-indexed (1 = መስከረም)
 * @returns {string}
 */
export function getEthiopianMonthName(monthNumber) {
  const index = Math.max(1, Math.min(13, parseInt(monthNumber, 10))) - 1;
  return ETHIOPIAN_MONTHS[index] || ETHIOPIAN_MONTHS[0];
}

/**
 * Algorithmic fallback conversion from Gregorian to Ethiopian date
 * @param {Date} date
 * @returns {{ year: number, month: number, day: number }}
 */
function calculateEthiopianDateFallback(date) {
  const gYear = date.getFullYear();

  // Ethiopian New Year (Meskerem 1) falls on Sep 11 in common years, Sep 12 in leap year preceding Ethiopian leap
  const newYearDay = ((gYear - 1) % 4 === 3) ? 12 : 11;
  const newYearDate = new Date(gYear, 8, newYearDay); // Sep (month index 8)

  let ethYear;
  let ethMonth;
  let ethDay;

  if (date >= newYearDate) {
    // Meskerem onwards (Sep - Dec)
    ethYear = gYear - 7;
    const diffDays = Math.floor((date.getTime() - newYearDate.getTime()) / (1000 * 60 * 60 * 24));
    ethMonth = Math.floor(diffDays / 30) + 1;
    ethDay = (diffDays % 30) + 1;
  } else {
    // Before Meskerem 1 (Jan - Sep)
    ethYear = gYear - 8;
    const prevNewYearDay = ((gYear - 2) % 4 === 3) ? 12 : 11;
    const prevNewYear = new Date(gYear - 1, 8, prevNewYearDay);
    const diffDays = Math.floor((date.getTime() - prevNewYear.getTime()) / (1000 * 60 * 60 * 24));
    ethMonth = Math.floor(diffDays / 30) + 1;
    ethDay = (diffDays % 30) + 1;
  }

  return { year: ethYear, month: Math.min(ethMonth, 13), day: Math.min(ethDay, 30) };
}

/**
 * Converts Gregorian date to Ethiopian date object
 * @param {Date|string|number} gregorianDate 
 * @returns {{ year: number, month: number, day: number, monthName: string }}
 */
export function toEthiopianDate(gregorianDate = new Date()) {
  const d = gregorianDate instanceof Date ? gregorianDate : new Date(gregorianDate);
  
  let year, month, day;

  try {
    const eth = EthDateTime.fromEuropeanDate(d);
    year = eth.year;
    month = eth.month;
    day = eth.date; // v2.x uses 'date' not 'day'
  } catch {
    // Fall back to algorithmic calculation
  }

  if (!year || !month || !day) {
    const fallback = calculateEthiopianDateFallback(d);
    year = fallback.year;
    month = fallback.month;
    day = fallback.day;
  }

  const monthName = getEthiopianMonthName(month);

  return {
    year,
    month,
    day,
    monthName
  };
}

/**
 * Formats an Ethiopian date into a human readable string (e.g. "ጥቅምት 10, 2019 ዓ.ም")
 * @param {Date|string|number} gregorianDate 
 * @returns {string}
 */
export function formatEthiopianDate(gregorianDate = new Date()) {
  const { day, monthName, year } = toEthiopianDate(gregorianDate);
  return `${monthName} ${day}, ${year} ዓ.ም`;
}
