import apiClient from './client';
import type {
  OperationListItem,
  OperationDto,
  OperationStatus,
  SplitOperationRequest,
  SplitResult,
} from '../types/routingSheet';

export async function getOperationsByRoutingSheet(routingSheetId: number) {
  const res = await apiClient.get<OperationListItem[]>(
    `/Operations/by-routing-sheet/${routingSheetId}`,
  );
  return res.data;
}

export async function getOperationsByGuild(guildId: number) {
  const res = await apiClient.get<OperationListItem[]>(
    `/Operations/by-guild/${guildId}`,
  );
  return res.data;
}

export async function getOperationById(id: number) {
  const res = await apiClient.get<OperationDto>(`/Operations/${id}`);
  return res.data;
}

export async function assignPerformer(id: number, performerId: number) {
  await apiClient.patch(`/Operations/${id}/assign-performer`, { performerId });
}

export async function removePerformer(id: number) {
  await apiClient.delete(`/Operations/${id}/performer`);
}

export async function changeOperationStatus(id: number, statusId: number) {
  await apiClient.patch(`/Operations/${id}/status`, { statusId });
}

export async function splitOperation(id: number, data: SplitOperationRequest) {
  const res = await apiClient.post<SplitResult>(`/Operations/${id}/split`, data);
  return res.data;
}

export async function getOperationStatuses() {
  const res = await apiClient.get<OperationStatus[]>('/OperationStatuses');
  return res.data;
}
