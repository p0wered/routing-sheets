import apiClient from './client';
import type { NamedReference, CreateNamedReference, Performer, CreatePerformer } from '../types/references';

function namedCrud(basePath: string) {
  return {
    getAll: async (): Promise<NamedReference[]> => {
      const res = await apiClient.get<NamedReference[]>(basePath);
      return res.data;
    },
    create: async (data: CreateNamedReference): Promise<NamedReference> => {
      const res = await apiClient.post<NamedReference>(basePath, data);
      return res.data;
    },
    update: async (id: number, data: CreateNamedReference): Promise<void> => {
      await apiClient.put(`${basePath}/${id}`, data);
    },
    remove: async (id: number): Promise<void> => {
      await apiClient.delete(`${basePath}/${id}`);
    },
  };
}

export const unitsApi = namedCrud('/Units');
export const guildsApi = namedCrud('/Guilds');

export const performersApi = {
  getAll: async (): Promise<Performer[]> => {
    const res = await apiClient.get<Performer[]>('/Performers');
    return res.data;
  },
  create: async (data: CreatePerformer): Promise<Performer> => {
    const res = await apiClient.post<Performer>('/Performers', data);
    return res.data;
  },
  update: async (id: number, data: CreatePerformer): Promise<void> => {
    await apiClient.put(`/Performers/${id}`, data);
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/Performers/${id}`);
  },
};
