import type { MouseEvent } from 'react';

interface DropdownListItem {
  key: string;
  label: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
}

interface DropdownListProps {
  items: DropdownListItem[];
  className?: string;
}

export function DropdownList({ items, className = '' }: DropdownListProps) {
  return (
    <div
      className={`absolute space-y-1 z-10 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-64 overflow-auto ${className}`}
    >
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

