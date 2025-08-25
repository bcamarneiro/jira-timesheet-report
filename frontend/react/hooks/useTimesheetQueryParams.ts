import { useCallback, useEffect, useMemo, useState } from 'react';

export type UseTimesheetQueryParams = {
  selectedUser: string;
  setSelectedUser: (value: string) => void;
  currentYear: number;
  currentMonth: number; // zero-indexed 0-11
  goPrevMonth: () => void;
  goNextMonth: () => void;
  setYearMonth: (year: number, monthZeroIndexed: number) => void;
};

function updateUrlWithYearMonth(year: number, monthZeroIndexed: number) {
  const url = new URL(window.location.href);
  url.searchParams.set('year', String(year));
  url.searchParams.set('month', String(monthZeroIndexed + 1));
  window.history.pushState({}, '', url.toString());
}

export function useTimesheetQueryParams(): UseTimesheetQueryParams {
  const nowUtc = useMemo(() => new Date(), []);
  const [selectedUser, setSelectedUserState] = useState('');
  const [currentYear, setCurrentYear] = useState<number>(nowUtc.getUTCFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(nowUtc.getUTCMonth());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    if (user) setSelectedUserState(user);
    const yearParam = Number.parseInt(params.get('year') || '', 10);
    const monthParam = Number.parseInt(params.get('month') || '', 10);
    if (Number.isFinite(yearParam) && yearParam > 1900) setCurrentYear(yearParam);
    if (Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12) setCurrentMonth(monthParam - 1);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hasYear = url.searchParams.get('year');
    const hasMonth = url.searchParams.get('month');
    if (!hasYear || !hasMonth) {
      url.searchParams.set('year', String(currentYear));
      url.searchParams.set('month', String(currentMonth + 1));
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const setSelectedUser = useCallback((value: string) => {
    setSelectedUserState(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('user', value); else url.searchParams.delete('user');
    window.history.pushState({}, '', url.toString());
  }, []);

  const setYearMonth = useCallback((year: number, monthZeroIndexed: number) => {
    setCurrentYear(year);
    setCurrentMonth(monthZeroIndexed);
    updateUrlWithYearMonth(year, monthZeroIndexed);
  }, []);

  const goPrevMonth = useCallback(() => {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    setYearMonth(newYear, newMonth);
  }, [currentMonth, currentYear, setYearMonth]);

  const goNextMonth = useCallback(() => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    setYearMonth(newYear, newMonth);
  }, [currentMonth, currentYear, setYearMonth]);

  return {
    selectedUser,
    setSelectedUser,
    currentYear,
    currentMonth,
    goPrevMonth,
    goNextMonth,
    setYearMonth
  };
}


