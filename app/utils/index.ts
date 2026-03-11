import type { Event, EventSlot, TimeSlot } from "~/types";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export const hours: TimeSlot[] = Array(12)
  .fill(undefined)
  .map((_, i) => ({ index: i, hour: i + 8, minute: 0 }));

export const availableSlots: EventSlot[] = Array(24)
  .fill(undefined)
  .map((_, i) => ({
    index: i,
    hour: Math.floor(i / 2 + 8),
    minute: i % 2 === 0 ? 0 : 30,
  }));

export function getSlotFromElement(target: HTMLElement) {
  if (!target.dataset.slot) {
    return;
  }

  return availableSlots.find((s) => s.index === Number(target.dataset.slot));
}

export function getSlotFromIndex(index: number) {
  return availableSlots.find((s) => s.index === index)!;
}

export function getTimeLabel(time: number) {
  const hours = (time / 2).toFixed(1);
  if (hours.endsWith(".0")) {
    return hours.slice(0, -2);
  }
  return hours;
}

export function getEventTime(event: Event) {
  return event.end.index - event.start.index + 1;
}
