import type { MouseEvent, ReactNode } from 'react';

interface DropdownListItem {
  key: string;
  label: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
}

interface DropdownListProps {
  items: DropdownListItem[];
  className?: string;
  /** Optional block above the list (e.g. language switcher) */
  header?: ReactNode;
}

export function DropdownList({ items, className = '', header }: DropdownListProps) {
  return (
    <div
      className={`absolute space-y-1 z-10 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg p-2.5 max-h-68 overflow-auto ${className}`}
    >
      {header != null && (
        <div className="pb-1">{header}</div>
      )}
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`w-full px-3 py-2 text-left text-sm cursor-pointer hover:bg-primary/8 rounded-lg transition-all ${
            item.isActive
              ? 'bg-primary/12 text-primary font-semibold'
              : 'text-black'
          }`}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

