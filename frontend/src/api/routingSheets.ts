import apiClient from './client';
import type {
  RoutingSheetListItem,
  RoutingSheetDetail,
  CreateRoutingSheetRequest,
  UpdateRoutingSheetRequest,
  ProductItem,
  RoutingSheetStatus,
  SplitRoutingSheetRequest,
} from '../types/routingSheet';

export async function getRoutingSheets(params?: {
  planPositionId?: number;
  productItemId?: number;
}) {
  const res = await apiClient.get<RoutingSheetListItem[]>('/RoutingSheets', { params });
  return res.data;
}

export async function getRoutingSheetById(id: number) {
  const res = await apiClient.get<RoutingSheetDetail>(`/RoutingSheets/${id}`);
  return res.data;
}

export async function createRoutingSheet(data: CreateRoutingSheetRequest) {
  const res = await apiClient.post<RoutingSheetListItem>('/RoutingSheets', data);
  return res.data;
}

export async function updateRoutingSheet(id: number, data: UpdateRoutingSheetRequest) {
  await apiClient.put(`/RoutingSheets/${id}`, data);
}

export async function deleteRoutingSheet(id: number) {
  await apiClient.delete(`/RoutingSheets/${id}`);
}

export async function changeRoutingSheetStatus(id: number, statusId: number) {
  await apiClient.patch(`/RoutingSheets/${id}/status`, { statusId });
}

export async function splitRoutingSheet(id: number, data: SplitRoutingSheetRequest) {
  const res = await apiClient.post<RoutingSheetListItem>(`/RoutingSheets/${id}/split`, data);
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
