export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return Number.isInteger(hours) ? `${hours.toFixed(0)}h` : `${hours.toFixed(1)}h`;
}


