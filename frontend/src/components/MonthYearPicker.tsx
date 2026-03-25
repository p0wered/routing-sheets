import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthYearPicker({ month, year, onChange }: MonthYearPickerProps) {
  const { t } = useTranslation();
  const monthNames = t('months', { returnObjects: true }) as string[];

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

  const label = monthNames[month - 1] ?? '';

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
        onClick={goBack}
        title={t('monthPicker.prev')}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="min-w-[160px] text-center text-sm font-semibold text-gray-900 select-none">
        {label} {year}
      </span>
      <button
        type="button"
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
        onClick={goForward}
        title={t('monthPicker.next')}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
