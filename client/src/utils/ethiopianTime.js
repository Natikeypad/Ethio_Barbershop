/**
 * Ethiopian Time Engine
 * Ethiopian traditional time starts counting from sunrise:
 * 6:00 AM Western = 12:00 Ethiopian Morning
 * 7:00 AM Western = 1:00 Ethiopian Day
 * 6:00 PM Western = 12:00 Ethiopian Night
 * 7:00 PM Western = 1:00 Ethiopian Night
 */

/**
 * Extracts hour, minute, and second in the Addis Ababa (Africa/Addis_Ababa) timezone
 * @param {Date|string|number} date 
 * @returns {{ hour: number, minute: number, second: number }}
 */
export function getAddisAbabaParts(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Addis_Ababa',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(d);
    let hour = 0;
    let minute = 0;
    let second = 0;
    for (const p of parts) {
      if (p.type === 'hour') hour = parseInt(p.value, 10);
      if (p.type === 'minute') minute = parseInt(p.value, 10);
      if (p.type === 'second') second = parseInt(p.value, 10);
    }
    if (hour === 24) hour = 0;
    return { hour, minute, second };
  } catch {
    // Fallback if Intl timeZone is unavailable (Addis Ababa is UTC+3)
    const utcHours = d.getUTCHours();
    const addisHour = (utcHours + 3) % 24;
    return { hour: addisHour, minute: d.getUTCMinutes(), second: d.getUTCSeconds() };
  }
}

/**
 * Converts a JS Date to Ethiopian traditional time
 * @param {Date|string|number} date 
 * @returns {{ hour: number, minute: number, second: number, period: string, formatted: string }}
 */
export function toEthiopianTime(date = new Date()) {
  const { hour: H, minute, second } = getAddisAbabaParts(date);
  
  // Ethiopian hour calculation:
  // Daytime (6:00 AM - 6:00 PM) and Nighttime (6:00 PM - 6:00 AM)
  const rawHour = H % 12;
  let ethHour = rawHour - 6;
  if (ethHour <= 0) {
    ethHour += 12;
  }
  
  // Determine period: 6AM - 6PM = ቀን (day), 6PM - 6AM = ሌሊት (night)
  const period = (H >= 6 && H < 18) ? 'ቀን' : 'ሌሊት';
  const minuteStr = String(minute).padStart(2, '0');
  const formatted = `${ethHour}:${minuteStr} ሰዓት ${period}`;

  return {
    hour: ethHour,
    minute,
    second,
    period,
    formatted
  };
}

/**
 * Returns formatted string like "1:30 ሰዓት"
 * @param {Date|string|number} date 
 * @returns {string}
 */
export function formatEthiopianTime(date = new Date()) {
  const { hour, minute } = toEthiopianTime(date);
  const minuteStr = String(minute).padStart(2, '0');
  return `${hour}:${minuteStr} ሰዓት`;
}

/**
 * Returns current time in Ethiopian format
 * @returns {string}
 */
export function getCurrentEthiopianTime() {
  return toEthiopianTime(new Date()).formatted;
}

/**
 * Returns standard 12h Western format for comparison display (e.g. "2:30 PM")
 * @param {Date|string|number} date 
 * @returns {string}
 */
export function formatWesternTime(date = new Date()) {
  const { hour: H, minute, second } = getAddisAbabaParts(date);
  const westernHour12 = H % 12 === 0 ? 12 : H % 12;
  const ampm = H >= 12 ? 'PM' : 'AM';
  const minuteStr = String(minute).padStart(2, '0');
  const secondStr = String(second).padStart(2, '0');
  return `${westernHour12}:${minuteStr}:${secondStr} ${ampm}`;
}
