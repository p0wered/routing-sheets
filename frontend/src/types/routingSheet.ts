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
  unitName: string | null;
}

export interface ProductItem {
  id: number;
  name: string;
  description: string | null;
}

export interface RoutingSheetStatus {
  id: number;
  code: string;
  name: string;
}

/** Позиция плана в ответе GET /RoutingSheets/:id */
export interface PlanPositionInRoutingSheet {
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
  planPosition?: PlanPositionInRoutingSheet | null;
  productItem?: ProductItem | null;
  unit?: { id: number; name: string } | null;
  status?: RoutingSheetStatus | null;
  operations?: OperationDto[];
}

export interface OperationStatus {
  id: number;
  code: string;
  name: string;
}

export interface OperationDto {
  id: number;
  routingSheetId: number;
  seqNumber: number;
  code: string | null;
  name: string;
  statusId: number | null;
  guildId: number | null;
  operationTypeId: number | null;
  performerId: number | null;
  price: number | null;
  sum: number | null;
  quantity: number;
  status: OperationStatus | null;
  guild: { id: number; name: string } | null;
  operationType: { id: number; name: string } | null;
  performer: { id: number; fullName: string; role: string | null } | null;
}

export interface OperationListItem {
  id: number;
  routingSheetId: number;
  seqNumber: number;
  code: string | null;
  name: string;
  statusId: number | null;
  guildId: number | null;
  operationTypeId: number | null;
  performerId: number | null;
  price: number | null;
  sum: number | null;
  quantity: number;
  statusName: string | null;
  guildName: string | null;
  operationTypeName: string | null;
  performerName: string | null;
  routingSheetNumber: string | null;
}

export interface SplitQuantityRequest {
  splitQuantity: number;
}

export interface SplitOperationRequest {
  splitQuantity: number;
}

export interface SplitResult {
  originalId: number;
  newId: number;
}

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600' },
  ACTIVE: { bg: 'bg-primary/12', text: 'text-primary' },
  COMPLETED: { bg: 'bg-success/12', text: 'text-success' },
  CANCELLED: { bg: 'bg-error/12', text: 'text-error' },
};

export const OP_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-600' },
  IN_PROGRESS: { bg: 'bg-primary/12', text: 'text-primary' },
  COMPLETED: { bg: 'bg-success/12', text: 'text-success' },
  CANCELLED: { bg: 'bg-error/12', text: 'text-error' },
};
