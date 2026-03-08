export interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const ROLE_LABELS: Record<string, string> = {
  WorkshopChief: 'Начальник цеха',
  WorkshopForeman: 'Мастер цеха',
  PlanningDept: 'Плановый отдел',
};
