import type { RoutingSheetStatus } from '../types/routingSheet';
import { STATUS_COLORS } from '../types/routingSheet';

interface StatusBadgeProps {
  statusId: number;
  statusName: string | null;
  statuses?: RoutingSheetStatus[];
  className?: string;
}

export function StatusBadge({ statusId, statusName, statuses, className = '' }: StatusBadgeProps) {
  const status = statuses?.find((s) => s.id === statusId);
  const code = status?.code ?? '';
  const label = statusName ?? status?.name ?? `#${statusId}`;
  const colors = STATUS_COLORS[code] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <span
      className={`inline-block ${colors.bg} ${colors.text} rounded-lg px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
