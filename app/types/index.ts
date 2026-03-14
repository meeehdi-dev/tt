export interface Time {
  hour: number;
  minute: number;
}

export interface Slot {
  index: number;
}

export interface TimeSlot extends Time, Slot {}

export interface EventSlot extends Slot {}

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
  start: EventSlot;
  end: EventSlot;

  project: string;
  description: string;
}
