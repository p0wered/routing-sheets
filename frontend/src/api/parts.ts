import apiClient from './client';
import type { Part, PartListItem, ProductPart } from '../types/part';

export async function getParts() {
  const res = await apiClient.get<PartListItem[]>('/Parts');
  return res.data;
}

export async function getPartById(id: number) {
  const res = await apiClient.get<Part>(`/Parts/${id}`);
  return res.data;
}

export async function getProductParts(productItemId?: number) {
  const res = await apiClient.get<ProductPart[]>('/ProductParts', {
    params: productItemId ? { productItemId } : undefined,
  });
  return res.data;
}
