import apiClient from './client';
import type {
  RoutingSheetListItem,
  RoutingSheetDetail,
  RoutingSheetStatus,
  ProductItem,
  SplitQuantityRequest,
  SplitResult,
} from '../types/routingSheet';

export async function getRoutingSheets(params?: {
  planPositionId?: number;
  productItemId?: number;
  guildId?: number;
  /** ISO 8601, фильтр по дате создания МЛ (включительно, сравнение с UTC на сервере) */
  createdFrom?: string;
  /** ISO 8601, верхняя граница даты создания МЛ (включительно) */
  createdTo?: string;
}) {
  const res = await apiClient.get<RoutingSheetListItem[]>('/RoutingSheets', { params });
  return res.data;
}

export async function getRoutingSheetById(id: number) {
  const res = await apiClient.get<RoutingSheetDetail>(`/RoutingSheets/${id}`);
  return res.data;
}

export async function generateRoutingSheet(planPositionId: number) {
  const res = await apiClient.post<RoutingSheetDetail>(
    `/RoutingSheets/generate/${planPositionId}`,
  );
  return res.data;
}

export async function changeRoutingSheetStatus(id: number, statusId: number) {
  await apiClient.patch(`/RoutingSheets/${id}/status`, { statusId });
}

export async function splitRoutingSheet(id: number, data: SplitQuantityRequest) {
  const res = await apiClient.post<SplitResult>(`/RoutingSheets/${id}/split`, data);
  return res.data;
}

export async function getProductItems() {
  const res = await apiClient.get<ProductItem[]>('/ProductItems');
  return res.data;
}

export async function getRoutingSheetStatuses() {
  const res = await apiClient.get<RoutingSheetStatus[]>('/RoutingSheetStatuses');
  return res.data;
}

export async function getUnits() {
  const res = await apiClient.get<{ id: number; name: string }[]>('/Units');
  return res.data;
}
