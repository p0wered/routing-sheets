import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DropdownList } from './DropdownList';
import { Spinner } from './Spinner';

export interface SelectOption<TValue = string> {
  value: TValue;
  label: string;
}

interface SelectProps<TValue = string> {
  value: TValue | null;
  onChange: (value: TValue | null) => void;
  options: SelectOption<TValue>[];
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function Select<TValue = string>({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  isLoading,
  className = '',
}: SelectProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption =
    value === null || value === undefined
      ? null
      : options.find((option) => option.value === value) ?? null;

  const handleToggle = () => {
    if (disabled || isLoading) return;
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (
    e: MouseEvent<HTMLButtonElement>,
    optionValue: TValue
  ) => {
    e.preventDefault();
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  const labelText = selectedOption?.label ?? placeholder ?? 'Выберите значение';

  return (
    <div ref={containerRef} className={`relative min-w-[260px] ${className}`}>
      <button
        type="button"
        className={`w-full h-full min-h-[2.75rem] px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white
        flex items-center justify-between gap-2 text-left focus:border-primary disabled:opacity-50
        transition-all disabled:cursor-not-allowed`}
        onClick={handleToggle}
        disabled={disabled || isLoading}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {isLoading ? <Spinner size="sm" /> : labelText}
        </span>
        <span className="shrink-0 text-gray-400">
          {!isLoading &&
            (isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            ))}
        </span>
      </button>

      {isOpen && !disabled && !isLoading && (
        <DropdownList
          className="w-full"
          items={options.map((option) => ({
            key: String(option.value),
            label: option.label,
            isActive:
              !!selectedOption && selectedOption.value === option.value,
            onClick: (e: MouseEvent<HTMLButtonElement>) =>
              handleOptionClick(e, option.value),
          }))}
        />
      )}
    </div>
  );
}
