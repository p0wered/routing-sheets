import apiClient from './client';
import type { PlanPositionListItem, PlanStatus } from '../types/plan';

export async function getPlanPositions(params?: {
  guildId?: number;
  month?: number;
  year?: number;
}) {
  const response = await apiClient.get<PlanPositionListItem[]>('/PlanPositions', { params });
  return response.data;
}

export async function getPlanPositionById(id: number) {
  const response = await apiClient.get<PlanPositionListItem>(`/PlanPositions/${id}`);
  return response.data;
}

export async function changePlanPositionStatus(id: number, statusId: number) {
  await apiClient.patch(`/PlanPositions/${id}/status`, { statusId });
}

export async function getPlanStatuses() {
  const response = await apiClient.get<PlanStatus[]>('/PlanStatuses');
  return response.data;
}
