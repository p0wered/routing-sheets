import apiClient from './client';
import type { User } from '../types/auth';

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  username: string;
  password?: string;
  role: string;
}

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/Users');
  return response.data;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<User>('/Users', data);
  return response.data;
}

export async function updateUser(
  id: number,
  data: UpdateUserRequest
): Promise<User> {
  const response = await apiClient.put<User>(`/Users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/Users/${id}`);
}
