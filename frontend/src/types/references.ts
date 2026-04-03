export interface NamedReference {
  id: number;
  name: string;
}

export interface Performer {
  id: number;
  fullName: string;
  role: string | null;
}

export interface CreateNamedReference {
  name: string;
}

export interface CreatePerformer {
  fullName: string;
  role?: string | null;
}

export type ReferenceTab = 'units' | 'guilds' | 'performers';
