import type { Event } from "~/types";

export default function useEvents() {
  const toast = useToast();

  const events = useState<Event[]>("events", () => []);
  const currentEvent = useState<Event | undefined>("currentEvent");
  const currentEventOrigin = useState<number | undefined>("currentEventOrigin");
  const selectedEvent = useState<Event | undefined>("selectedEvent");

  const { endOfDay } = useDate();

  function onSlotHover(e: MouseEvent) {
    if (!currentEvent.value || !currentEventOrigin.value) {
      return;
    }

    const target = e.target as HTMLElement;

    const slot = Number(target.dataset.minute);

    if (slot === currentEventOrigin.value) {
      currentEvent.value.start = currentEventOrigin.value;
      currentEvent.value.end = currentEventOrigin.value + 30;
    } else if (slot < currentEventOrigin.value) {
      currentEvent.value.start = slot;
      currentEvent.value.end = currentEventOrigin.value + 30;
    } else {
      currentEvent.value.end = slot + 30;
      currentEvent.value.start = currentEventOrigin.value;
    }
  }

  function addEvent() {
    if (
      events.value.filter(
        (e) =>
          e.day === currentEvent.value!.day &&
          e.start >= currentEvent.value!.start &&
          e.end <= currentEvent.value!.end,
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

    if (day) {
      event.day = day;
    }

    const eventLength = event.end - event.start;

    const diff = event.start - minute;
    const endMinute = event.end - diff;

    if (endMinute > endOfDay.value) {
      event.start = endOfDay.value - eventLength;
      event.end = endOfDay.value;
      return;
    }

    event.start = minute;
    event.end = endMinute;
  }

  function moveEventStart(eventId: string, minute: number) {
    const event = events.value.find((e) => e.id === eventId)!;

    event.start = minute;
  }

  function moveEventBottom(eventId: string, minute: number) {
    const event = events.value.find((e) => e.id === eventId)!;

    event.end = minute + 30;
  }

  function createEvent(day: number, minute: number) {
    currentEvent.value = {
      id: crypto.randomUUID(),
      day,
      start: minute,
      end: minute + 30,
      project: "",
      description: "",
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
