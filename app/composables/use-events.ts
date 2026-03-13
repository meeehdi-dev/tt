import type { Event, Slot } from "~/types";

export default function useEvents() {
  const toast = useToast();

  const events = useState<Event[]>("events", () => []);
  const currentEvent = useState<Event | undefined>("currentEvent");
  const selectedEvent = useState<Event | undefined>("selectedEvent");

  function onSlotHover(e: MouseEvent) {
    if (!currentEvent.value) {
      return;
    }

    const target = e.target as HTMLElement;

    const slot = getSlotFromElement(target);
    if (!slot) {
      return;
    }

    if (slot.index === currentEvent.value.source.index) {
      currentEvent.value.start = currentEvent.value.source;
      currentEvent.value.end = currentEvent.value.source;
    } else if (slot.index < currentEvent.value.source.index) {
      currentEvent.value.start = slot;
      currentEvent.value.end = currentEvent.value.source;
    } else {
      currentEvent.value.end = slot;
      currentEvent.value.start = currentEvent.value.source;
    }
  }

  function addEvent() {
    if (
      events.value.filter(
        (e) =>
          e.day === currentEvent.value!.day &&
          e.start.index >= currentEvent.value!.start.index &&
          e.end.index <= currentEvent.value!.end.index,
      ).length > 0
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
  }

  function removeEvent(eventId: string) {
    events.value = events.value.filter((e) => e.id !== eventId);
  }

  function moveEvent(eventId: string, slot: Slot, day?: number) {
    const event = events.value.find((e) => e.id === eventId);
    if (!event) {
      return;
    }

    if (day) {
      event.day = day;
    }

    const eventLength = event.end.index - event.start.index;

    const diff = event.start.index - slot.index;
    const endIndex = event.end.index - diff;

    if (endIndex > 23) {
      event.start = getSlotFromIndex(23 - eventLength);
      event.end = getSlotFromIndex(23);
      return;
    }

    event.start = slot;
    event.end = getSlotFromIndex(endIndex);
  }

  function moveEventStart(eventId: string, slot: Slot) {
    const event = events.value.find((e) => e.id === eventId)!;

    event.start = slot;
  }

  function moveEventBottom(eventId: string, slot: Slot) {
    const event = events.value.find((e) => e.id === eventId)!;

    event.end = slot;
  }

  function createEvent(day: number, slot: Slot) {
    currentEvent.value = {
      id: crypto.randomUUID(),
      day,
      start: slot,
      end: slot,
      source: slot,
      project: "",
      description: "",
    };
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
