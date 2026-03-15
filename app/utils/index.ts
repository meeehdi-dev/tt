import type { Event, StartOfWeekDay } from "~/types";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export function getDays(startOfWeekOffset: StartOfWeekDay) {
  return Array(7)
    .fill(undefined)
    .map((_, i) => (i + startOfWeekOffset + 7) % 7);
}

export const hours: number[] = Array(24)
  .fill(undefined)
  .map((_, i) => i * 60);

export const availableSlots: number[] = Array(48)
  .fill(undefined)
  .map((_, i) => i * 30);

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

export function getTimeLabel(time: number) {
  const hours = (time / 60).toFixed(1);
  if (hours.endsWith(".0")) {
    return hours.slice(0, -2);
  }
  return hours;
}

export function getEventTime(event: Event) {
  return event.end - event.start;
}

export function getSlotHeight() {
  const slot = document.querySelector<HTMLElement>("[data-group='slot']")!;
  if (!slot) {
    return 0;
  }
  const computedStyle = getComputedStyle(slot);
  return (
    slot.getBoundingClientRect().height -
    Number(computedStyle.borderTopWidth.slice(0, -2)) * 2 // NOTE: ignore borders
  );
}
