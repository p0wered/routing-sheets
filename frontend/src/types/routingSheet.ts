export interface RoutingSheetListItem {
  id: number;
  number: string;
  name: string;
  planPositionId: number | null;
  productItemId: number | null;
  statusId: number;
  quantity: number;
  createdAt: string;
  statusName: string | null;
  planPositionName: string | null;
  productItemName: string | null;
}

export interface RoutingSheetDetail {
  id: number;
  number: string;
  name: string;
  planPositionId: number | null;
  productItemId: number | null;
  unitId: number | null;
  statusId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRoutingSheetRequest {
  number: string;
  name: string;
  planPositionId: number | null;
  productItemId: number | null;
  unitId: number | null;
  quantity: number;
}

export type UpdateRoutingSheetRequest = CreateRoutingSheetRequest;

export interface ProductItem {
  id: number;
  name: string;
  description: string | null;
  quantityPlanned: number;
}

export interface RoutingSheetStatus {
  id: number;
  code: string;
  name: string;
}

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600' },
  ACTIVE: { bg: 'bg-blue-50', text: 'text-blue-700' },
  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-600' },
};
