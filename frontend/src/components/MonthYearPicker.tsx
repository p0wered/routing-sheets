import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthYearPicker({ month, year, onChange }: MonthYearPickerProps) {
  const goBack = () => {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const goForward = () => {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
        onClick={goBack}
        title="Предыдущий месяц"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="min-w-[160px] text-center text-sm font-semibold text-gray-900 select-none">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <button
        type="button"
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
        onClick={goForward}
        title="Следующий месяц"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
