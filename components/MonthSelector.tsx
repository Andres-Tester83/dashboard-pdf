'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

export default function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };
  const next = () => {
    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return;
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const isCurrentMonth = (() => {
    const now = new Date();
    return month === now.getMonth() + 1 && year === now.getFullYear();
  })();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-white font-semibold text-sm">{MONTHS[month - 1]} {year}</span>
        {isCurrentMonth && (
          <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
            Actual
          </span>
        )}
      </div>

      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
