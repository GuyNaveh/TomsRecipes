const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const MONTH_NAMES = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

/** Returns today's date as 'YYYY-MM-DD' */
export function getToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Returns array of 'YYYY-MM-DD' strings starting from startDate, length numDays */
export function getDateRange(startDate, numDays) {
  const dates = [];
  // Parse as local date to avoid UTC shift issues
  const [year, month, day] = startDate.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  for (let i = 0; i < numDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

/** Formats a 'YYYY-MM-DD' string to Hebrew-style date e.g. "יום ראשון, 6 באפריל 2026" */
export function formatHebrewDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayName = DAY_NAMES[d.getDay()];
  const monthName = MONTH_NAMES[d.getMonth()];
  return `יום ${dayName}, ${d.getDate()} ב${monthName} ${d.getFullYear()}`;
}

/** Picks a random element from cookNames array */
export function randomCook(cookNames) {
  if (!cookNames || cookNames.length === 0) return null;
  return cookNames[Math.floor(Math.random() * cookNames.length)];
}

/** Returns true if dateStr is today */
export function isToday(dateStr) {
  return dateStr === getToday();
}
