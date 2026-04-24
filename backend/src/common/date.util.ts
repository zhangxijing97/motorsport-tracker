import type { SessionStatus } from '../events/types';

export function normalizeDate(date?: string): string {
  if (date) return date;

  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export function getYearFromDate(date: string): number {
  return Number(date.slice(0, 4));
}

export function isDateWithinRange(
  selectedDate: string,
  startDate: string,
  endDate: string,
): boolean {
  const start = startDate.slice(0, 10);
  const end = endDate.slice(0, 10);

  return selectedDate >= start && selectedDate <= end;
}

export function isSameDate(selectedDate: string, targetDate: string): boolean {
  return targetDate.slice(0, 10) === selectedDate;
}

export function computeSessionStatus(
  startTime: string,
  endTime: string,
  isCancelled: boolean,
): SessionStatus {
  if (isCancelled) return 'cancelled';

  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) return 'upcoming';
  if (now > end) return 'finished';

  return 'live';
}
