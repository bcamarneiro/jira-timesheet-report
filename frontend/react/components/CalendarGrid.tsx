import React from 'react';
import { getMonthStartWeekday, getDaysInMonth } from '../utils/date';

type CalendarGridProps = {
  year: number;
  monthZeroIndexed: number;
  children: React.ReactNode;
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  monthZeroIndexed,
  children
}) => {
  const firstWeekday = getMonthStartWeekday(year, monthZeroIndexed);
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create empty cells for days before the month starts
  const emptyCells = Array.from({ length: firstWeekday }, (_, i) => (
    <div key={`empty-${i}`} className="border border-gray-200 min-h-[100px] p-2 bg-gray-50" />
  ));

  return (
    <div className="relative">
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekdayLabels.map(w => (
          <div key={w} className="text-center font-bold text-sm py-2">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {emptyCells}
        {children}
      </div>
    </div>
  );
};
