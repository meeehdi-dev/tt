export const WEEK_START = Number(import.meta.env.VITE_WEEK_START || 0);
export const WEEK_END = Number(import.meta.env.VITE_WEEK_END || 6);
export const DAY_START = Number(import.meta.env.VITE_DAY_START || 9);
export const DAY_END = Number(import.meta.env.VITE_DAY_END || 18);

export enum State {
  Idle = "idle",
  Grabbing = "grabbing",
  Focused = "focused",
  Selecting = "selecting",
}

export interface SlotRange {
  day: number;
  start: number;
  end: number;
  note: string;
}

export const times = Array(49)
  .fill(undefined)
  .map((_, i) => i / 2)
  .slice(DAY_START * 2, -48 + DAY_END * 2);
export const slots = times.slice(0, -1);
enum Day {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}
export const days = Object.values(Day).filter(
  (d) => typeof d === "number" && d >= WEEK_START && d <= WEEK_END,
) as number[];
