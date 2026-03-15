export interface PlanPositionListItem {
  id: number;
  documentNumber: string;
  documentDate: string;
  planMonth: number;
  planYear: number;
  positionCode: string;
  name: string;
  productItemId: number;
  quantityPlanned: number;
  guildId: number;
  statusId: number;
  guildName: string | null;
  statusName: string | null;
  productItemName: string | null;
}

export interface PlanStatus {
  id: number;
  code: string;
  name: string;
}

export const PLAN_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: 'bg-success/12', text: 'text-success' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-500' },
};
