export enum StartOfWeekDay {
  Saturday = -1,
  Sunday = 0,
  Monday = 1,
}

export interface Event {
  id: string;
  date: string;
  start: number;
  end: number;

  projectId: string;
  description: string | null;
}

export interface Project {
  id: string;
  name: string;
  deletedAt?: string | null;
}
