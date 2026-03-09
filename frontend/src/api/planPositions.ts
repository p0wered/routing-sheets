import apiClient from './client';

export interface PlanPositionListItem {
  id: number;
  documentNumber: string;
  documentDate: string; // ISO date from backend
  planningPeriod: string | null;
  positionCode: string;
  name: string;
  productItemId: number;
  quantityPlanned: number;
}

export interface CreatePlanPositionRequest {
  documentNumber: string;
  documentDate: string; // ISO (YYYY-MM-DD)
  planningPeriod?: string | null;
  positionCode: string;
  name: string;
  productItemId: number;
  quantityPlanned: number;
}

export async function getPlanPositions() {
  const response = await apiClient.get<PlanPositionListItem[]>('/PlanPositions');
  return response.data;
}

export async function createPlanPosition(payload: CreatePlanPositionRequest) {
  const response = await apiClient.post<PlanPositionListItem>(
    '/PlanPositions',
    payload
  );
  return response.data;
}

