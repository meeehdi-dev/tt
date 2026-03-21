import type { Event } from "~/types";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export const SLOT_DURATION = 30;

export const hours: number[] = Array(24)
  .fill(undefined)
  .map((_, i) => i * 60);

export const availableSlots: number[] = Array((24 * 60) / SLOT_DURATION)
  .fill(undefined)
  .map((_, i) => i * SLOT_DURATION);

type Anchor = "top" | "bottom";
export function getSlotElementFromElement(target: HTMLElement, anchor: Anchor) {
  const rect = target.getBoundingClientRect();
  const x = rect.x + rect.width / 2;
  const y = rect.y + (anchor === "bottom" ? rect.height : 0);

  const hiddenElements: HTMLElement[] = [target];
  target.style.visibility = "hidden";

  let el = document.elementFromPoint(x, y) as HTMLElement | null;

  if (el && el.dataset.group !== "slot") {
    const blockingEvent = el.closest<HTMLElement>("[data-start]");
    if (blockingEvent) {
      blockingEvent.style.visibility = "hidden";
      hiddenElements.push(blockingEvent);
      el = document.elementFromPoint(x, y) as HTMLElement | null;
    }
  }

  let slotElement = el?.dataset.group === "slot" ? el : null;

  for (const el of hiddenElements) {
    el.style.visibility = "";
  }

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

const TIME_LABEL_SUFFIX = " hrs";
export function getTimeLabel(time: number) {
  const hours = (time / 60).toFixed(1);
  if (hours.endsWith(".0")) {
    return hours.slice(0, -2) + TIME_LABEL_SUFFIX;
  }
  return hours + TIME_LABEL_SUFFIX;
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
