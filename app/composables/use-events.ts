import type { Event } from "~/types";

export default function useEvents() {
  const toast = useToast();

  const events = useState<Event[]>("events", () => []);
  const currentEvent = useState<Event | undefined>("currentEvent");
  const currentEventOrigin = useState<number | undefined>("currentEventOrigin");
  const selectedEvent = useState<Event | undefined>("selectedEvent");

  const { startOfDay, endOfDay } = useDate();

  function hasOverlap(
    day: number,
    start: number,
    end: number,
    excludeId?: string,
  ) {
    return events.value.some(
      (e) =>
        e.id !== excludeId && e.day === day && e.start < end && e.end > start,
    );
  }

  function onSlotHover(e: MouseEvent) {
    if (!currentEvent.value || currentEventOrigin.value === undefined) {
      return;
    }

    const target = e.target as HTMLElement;

    const slot = Number(target.dataset.minute);

    if (slot === currentEventOrigin.value) {
      currentEvent.value.start = currentEventOrigin.value;
      currentEvent.value.end = currentEventOrigin.value + SLOT_DURATION;
    } else if (slot < currentEventOrigin.value) {
      currentEvent.value.start = slot;
      currentEvent.value.end = currentEventOrigin.value + SLOT_DURATION;
    } else {
      currentEvent.value.end = slot + SLOT_DURATION;
      currentEvent.value.start = currentEventOrigin.value;
    }
  }

  function addEvent() {
    if (
      hasOverlap(
        currentEvent.value!.day,
        currentEvent.value!.start,
        currentEvent.value!.end,
      )
    ) {
      toast.add({
        title: "Unable to create event",
        description: "An event already exists in that timespan",
        color: "error",
      });
    } else {
      events.value.push(currentEvent.value!);
      selectedEvent.value = currentEvent.value;
    }

    currentEvent.value = undefined;
    currentEventOrigin.value = undefined;
  }

  function removeEvent(eventId: string) {
    events.value = events.value.filter((e) => e.id !== eventId);
  }

  function moveEvent(eventId: string, minute: number, day?: number) {
    const event = events.value.find((e) => e.id === eventId);
    if (!event) {
      return;
    }

    const targetDay = day !== undefined ? day : event.day;
    const eventLength = event.end - event.start;

    let candidateStart: number;
    let candidateEnd: number;

    const diff = event.start - minute;
    const endMinute = event.end - diff;

    if (endMinute > endOfDay.value) {
      candidateStart = endOfDay.value - eventLength;
      candidateEnd = endOfDay.value;
    } else if (minute < startOfDay.value) {
      candidateStart = startOfDay.value;
      candidateEnd = startOfDay.value + eventLength;
    } else {
      candidateStart = minute;
      candidateEnd = endMinute;
    }

    if (hasOverlap(targetDay, candidateStart, candidateEnd, eventId)) {
      const blocker = events.value.find(
        (e) =>
          e.id !== eventId &&
          e.day === targetDay &&
          e.start < candidateEnd &&
          e.end > candidateStart,
      );

      if (!blocker) return;

      const overflowBottom = candidateEnd - blocker.start;
      const overflowTop = blocker.end - candidateStart;

      if (overflowBottom <= overflowTop) {
        candidateEnd = blocker.start;
        candidateStart = candidateEnd - eventLength;
      } else {
        candidateStart = blocker.end;
        candidateEnd = candidateStart + eventLength;
      }

      if (candidateStart < startOfDay.value) {
        candidateStart = startOfDay.value;
        candidateEnd = candidateStart + eventLength;
      }
      if (candidateEnd > endOfDay.value) {
        candidateEnd = endOfDay.value;
        candidateStart = candidateEnd - eventLength;
      }

      if (hasOverlap(targetDay, candidateStart, candidateEnd, eventId)) {
        return;
      }
    }

    event.day = targetDay;
    event.start = candidateStart;
    event.end = candidateEnd;
  }

  function moveEventStart(eventId: string, minute: number) {
    const event = events.value.find((e) => e.id === eventId)!;

    const blocker = events.value.find(
      (e) =>
        e.id !== eventId &&
        e.day === event.day &&
        e.start < event.end &&
        e.end > minute,
    );

    if (blocker) {
      if (blocker.end < event.end) {
        event.start = blocker.end;
      }
      return;
    }

    event.start = minute;
  }

  function moveEventBottom(eventId: string, minute: number) {
    const event = events.value.find((e) => e.id === eventId)!;
    const candidateEnd = minute + SLOT_DURATION;

    const blocker = events.value.find(
      (e) =>
        e.id !== eventId &&
        e.day === event.day &&
        e.start < candidateEnd &&
        e.end > event.start,
    );

    if (blocker) {
      if (blocker.start > event.start) {
        event.end = blocker.start;
      }
      return;
    }

    event.end = candidateEnd;
  }

  function createEvent(day: number, minute: number) {
    currentEvent.value = {
      id: crypto.randomUUID(),
      day,
      start: minute,
      end: minute + SLOT_DURATION,
      project: "",
      description: null,
    };
    currentEventOrigin.value = minute;
  }

  function saveEvent(
    eventId: string,
    data: Pick<Event, "project" | "description">,
  ) {
    const event = events.value.find((e) => e.id === eventId)!;

    event.project = data.project;
    event.description = data.description;

    selectedEvent.value = undefined;
  }

  function cancelEvent() {
    events.value = events.value.filter((e) => e.id !== selectedEvent.value!.id);

    selectedEvent.value = undefined;
  }

  function selectEvent(eventId: string) {
    selectedEvent.value = events.value.find((e) => e.id === eventId);
  }

  return {
    events: readonly(events),
    currentEvent: readonly(currentEvent),
    selectedEvent: readonly(selectedEvent),

    createEvent,
    cancelEvent,
    addEvent,
    removeEvent,
    selectEvent,
    moveEvent,
    moveEventStart,
    moveEventBottom,
    saveEvent,

    onSlotHover,
  };
}
