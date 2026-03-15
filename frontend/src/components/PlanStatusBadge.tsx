import { PLAN_STATUS_COLORS } from '../types/plan';
import type { PlanStatus } from '../types/plan';

interface PlanStatusBadgeProps {
  statusId: number;
  statusName: string | null;
  statuses?: PlanStatus[];
  className?: string;
}

export function PlanStatusBadge({ statusId, statusName, statuses, className = '' }: PlanStatusBadgeProps) {
  const status = statuses?.find((s) => s.id === statusId);
  const code = status?.code ?? '';
  const label = statusName ?? status?.name ?? `#${statusId}`;
  const colors = PLAN_STATUS_COLORS[code] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <span
      className={`inline-block ${colors.bg} ${colors.text} rounded-lg px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
