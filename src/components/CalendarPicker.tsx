import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarPickerProps {
  matrixDates: Set<string>;
  onCancel: () => void;
  onConfirm: (selected: Set<string>) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const formatKey = (year: number, month: number, day: number) => {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${mm}/${dd}/${year}`;
};

const CalendarPicker: React.FC<CalendarPickerProps> = ({ matrixDates, onCancel, onConfirm }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const items: Array<number | null> = [];
    for (let i = 0; i < firstDay; i++) items.push(null);
    for (let d = 1; d <= daysInMonth; d++) items.push(d);
    return items;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const toggle = (day: number) => {
    const key = formatKey(viewYear, viewMonth, day);
    if (!matrixDates.has(key)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllInMonth = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const cell of cells) {
        if (cell === null) continue;
        const key = formatKey(viewYear, viewMonth, cell);
        if (matrixDates.has(key)) next.add(key);
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Select Days</h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-medium text-gray-800 dark:text-gray-100">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              if (cell === null) {
                return <div key={idx} />;
              }
              const key = formatKey(viewYear, viewMonth, cell);
              const hasMatrix = matrixDates.has(key);
              const isSelected = selected.has(key);
              const isToday =
                cell === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();

              const base = 'h-9 w-full rounded text-sm flex items-center justify-center transition-colors';
              let classes = base;
              if (isSelected) {
                classes += ' bg-blue-500 text-white font-semibold';
              } else if (hasMatrix) {
                classes += ' bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/60 cursor-pointer';
              } else {
                classes += ' text-gray-400 dark:text-gray-600 cursor-not-allowed';
              }
              if (isToday && !isSelected) {
                classes += ' ring-1 ring-blue-400';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggle(cell)}
                  disabled={!hasMatrix}
                  className={classes}
                  title={hasMatrix ? `Matrix on ${key}` : 'No matrix on this day'}
                >
                  {cell}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-xs">
            <button
              onClick={selectAllInMonth}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Select all in month
            </button>
            <button
              onClick={clearSelection}
              className="text-gray-600 dark:text-gray-400 hover:underline"
              disabled={selected.size === 0}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <span className="mr-auto self-center text-xs text-gray-500 dark:text-gray-400">
            {selected.size} day{selected.size === 1 ? '' : 's'} selected
          </span>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={selected.size === 0}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPicker;
