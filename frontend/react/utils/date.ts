export function getMonthStartWeekday(year: number, monthZeroIndexed: number): number {
  return new Date(Date.UTC(year, monthZeroIndexed, 1)).getUTCDay();
}

export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(Date.UTC(year, monthZeroIndexed + 1, 0)).getUTCDate();
}

export function isoDateFromYMD(year: number, monthZeroIndexed: number, day: number): string {
  const d = new Date(Date.UTC(year, monthZeroIndexed, day));
  return d.toISOString().substring(0, 10);
}

export function monthLabel(year: number, monthZeroIndexed: number): string {
  return new Date(Date.UTC(year, monthZeroIndexed, 1)).toLocaleString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
}


