export enum Day {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

export enum StartOfWeekDay {
  Saturday = -1,
  Sunday = 0,
  Monday = 1,
}

export interface Event {
  id: string;
  day: Day;
  start: number;
  end: number;

  project: string;
  description: string | null;
}
