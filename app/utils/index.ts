import type { Event, EventSlot, StartOfWeekDay, TimeSlot } from "~/types";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export function getDays(startOfWeekOffset: StartOfWeekDay) {
  return Array(7)
    .fill(undefined)
    .map((_, i) => (i + startOfWeekOffset + 7) % 7);
}

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
  return availableSlots.find((s) => s.index === Number(target.dataset.slot));
}

type Anchor = "top" | "bottom";
export function getSlotElementFromElement(target: HTMLElement, anchor: Anchor) {
  const rect = target.getBoundingClientRect();
  const x = rect.x + rect.width / 2;
  const y = rect.y + (anchor === "bottom" ? rect.height : 0);
  target.style.visibility = "hidden";
  let slotElement = document.elementFromPoint(x, y) as HTMLElement;
  target.style.visibility = "";
  if (!slotElement) {
    return;
  }

  const slotElementRect = slotElement.getBoundingClientRect();
  if (anchor === "top") {
    if (
      y > slotElementRect.y + slotElementRect.height / 2 &&
      slotElement.nextElementSibling
    ) {
      slotElement = slotElement.nextElementSibling as HTMLElement;
    }
  } else if (anchor === "bottom") {
    if (
      y < slotElementRect.y + slotElementRect.height / 2 &&
      slotElement.previousElementSibling
    ) {
      slotElement = slotElement.previousElementSibling as HTMLElement;
    }
  }

  return slotElement;
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

export function getSlotHeight() {
  const el = document.getElementById("slot-0-0")!;
  const computedStyle = getComputedStyle(el);
  return (
    el.getBoundingClientRect().height -
    Number(computedStyle.borderTopWidth.slice(0, -2)) * 2 // NOTE: ignore borders
  );
}
