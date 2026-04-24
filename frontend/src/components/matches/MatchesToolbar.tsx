'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SectionCard from '../common/SectionCard';

type MatchesToolbarProps = {
  selectedDate?: string;
};

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatToolbarLabel(selectedDate?: string) {
  if (!selectedDate) return 'Today';

  const date = new Date(`${selectedDate}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function shiftDate(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function MatchesToolbar({ selectedDate }: MatchesToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeDate = useMemo(() => {
    return selectedDate ?? getTodayString();
  }, [selectedDate]);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(activeDate);

  useEffect(() => {
    setDraftDate(activeDate);
  }, [activeDate]);

  const displayLabel = formatToolbarLabel(selectedDate);

  function pushDateToUrl(nextDate?: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextDate) {
      params.set('date', nextDate);
    } else {
      params.delete('date');
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function handleApplyDate() {
    pushDateToUrl(draftDate);
    setIsDatePickerOpen(false);
  }

  function handleClearDate() {
    const today = getTodayString();
    setDraftDate(today);
    pushDateToUrl(undefined);
    setIsDatePickerOpen(false);
  }

  function handleShiftDay(days: number) {
    const nextDate = shiftDate(activeDate, days);
    setDraftDate(nextDate);
    pushDateToUrl(nextDate);
  }

  return (
    <SectionCard className="relative p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleShiftDay(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-[24px] font-semibold transition hover:bg-neutral-200"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={() => setIsDatePickerOpen((prev) => !prev)}
          className="font-display flex items-center gap-2 text-[18px] font-semibold text-neutral-900"
        >
          <span>{displayLabel}</span>
          <span className="text-[11px]">▼</span>
        </button>

        <button
          type="button"
          onClick={() => handleShiftDay(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-[24px] font-semibold transition hover:bg-neutral-200"
        >
          ›
        </button>
      </div>

      {isDatePickerOpen ? (
        <div className="absolute left-1/2 top-[72px] z-20 w-[280px] -translate-x-1/2 rounded-[24px] border border-neutral-200 bg-white p-4 shadow-lg">
          <div className="mb-3">
            <label className="mb-2 block text-[13px] font-medium text-neutral-500">
              Select date
            </label>

            <input
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-[14px] outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleClearDate}
              className="rounded-xl border border-neutral-200 px-3 py-2 text-[13px] text-neutral-700"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={handleApplyDate}
              className="rounded-xl bg-black px-4 py-2 text-[13px] font-medium text-white"
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}