export interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  guildId: number | null;
  guildName: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** Role keys sent by the API; labels come from i18n `roles.*`. */
export const USER_ROLE_KEYS = ['WorkshopChief', 'WorkshopForeman', 'PlanningDept'] as const;
