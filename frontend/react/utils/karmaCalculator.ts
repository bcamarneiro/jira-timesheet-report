import type { JiraWorklog } from '../../types/JiraWorklog';

export type KarmaCalculation = {
  totalSeconds: number;
  netKarmaSeconds: number;
  totalHours: number;
  netKarmaHours: number;
};

export function calculateUserKarma(
  days: Record<string, JiraWorklog[]>,
  timeOffHours: Record<string, number> = {}
): KarmaCalculation {
  let totalSeconds = 0;
  let netKarmaSeconds = 0;
  
  const now = new Date();
  const todayStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  Object.entries(days).forEach(([isoDate, worklogs]) => {
    const dayTotalSeconds = worklogs.reduce((sum, wl) => sum + wl.timeSpentSeconds, 0);
    totalSeconds += dayTotalSeconds;
    
    const jsDate = new Date(Date.UTC(
      parseInt(isoDate.substring(0, 4)),
      parseInt(isoDate.substring(5, 7)) - 1,
      parseInt(isoDate.substring(8, 10))
    ));
    
    const weekday = jsDate.getUTCDay(); // 0=Sun,6=Sat
    const isWeekend = weekday === 0 || weekday === 6;
    const baselineSeconds = isWeekend ? 0 : 8 * 3600;
    const isBeforeToday = jsDate.getTime() < todayStartUtc.getTime();
    const timeOffSeconds = (!isWeekend ? (timeOffHours[isoDate] || 0) * 3600 : 0);
    
    if (isBeforeToday) {
      netKarmaSeconds += (dayTotalSeconds + timeOffSeconds - baselineSeconds);
    }
  });

  return {
    totalSeconds,
    netKarmaSeconds,
    totalHours: totalSeconds / 3600,
    netKarmaHours: netKarmaSeconds / 3600
  };
}
