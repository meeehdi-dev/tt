import type { Event } from "~/types";

export default function useEvents() {
  const toast = useToast();

  const currentEvent = useState<Event | undefined>("currentEvent");
  const currentEventOrigin = useState<number | undefined>("currentEventOrigin");
  const selectedEvent = useState<Event | undefined>("selectedEvent");

  const { startOfDay, endOfDay, startOfWeek } = useDate();

  const startDate = computed(() => startOfWeek.value.format("YYYY-MM-DD"));

  const { data: events } = useAsyncData(
    "events",
    () =>
      $fetch("/api/events", {
        query: {
          startDate: startDate.value,
          endDate: startOfWeek.value.add(6, "day").format("YYYY-MM-DD"),
        },
      }),
    { default: () => [] as Event[], watch: [startDate], server: false },
  );

  function hasOverlap(
    date: string,
    start: number,
    end: number,
    excludeId?: string,
  ) {
    return events.value.some(
      (e) =>
        e.id !== excludeId && e.date === date && e.start < end && e.end > start,
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
        currentEvent.value!.date,
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

  async function removeEvent(eventId: string) {
    const event = events.value.find((e) => e.id === eventId);
    events.value = events.value.filter((e) => e.id !== eventId);

    if (event?.projectId) {
      try {
        await $fetch(`/api/events/${eventId}`, { method: "DELETE" });
      } catch {
        toast.add({
          title: "Failed to delete event",
          color: "error",
        });
      }
    }
  }

  async function moveEvent(eventId: string, minute: number, date?: string) {
    const event = events.value.find((e) => e.id === eventId);
    if (!event) {
      return;
    }

    const targetDate = date !== undefined ? date : event.date;
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

    if (hasOverlap(targetDate, candidateStart, candidateEnd, eventId)) {
      const blocker = events.value.find(
        (e) =>
          e.id !== eventId &&
          e.date === targetDate &&
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

      if (hasOverlap(targetDate, candidateStart, candidateEnd, eventId)) {
        return;
      }
    }

    if (event.projectId) {
      try {
        await $fetch(`/api/events/${eventId}`, {
          method: "PATCH",
          body: { date: event.date, start: event.start, end: event.end },
        });

        event.date = targetDate;
        event.start = candidateStart;
        event.end = candidateEnd;
        events.value = [...events.value];
      } catch {
        toast.add({ title: "Failed to update event", color: "error" });
      }
    }
  }

  function moveEventStart(eventId: string, minute: number) {
    const event = events.value.find((e) => e.id === eventId)!;

    const blocker = events.value.find(
      (e) =>
        e.id !== eventId &&
        e.date === event.date &&
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

    if (event.projectId) {
      $fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        body: { start: event.start },
      }).catch(() => {
        toast.add({ title: "Failed to update event", color: "error" });
      });
    }
  }

  function moveEventBottom(eventId: string, minute: number) {
    const event = events.value.find((e) => e.id === eventId)!;
    const candidateEnd = minute + SLOT_DURATION;

    const blocker = events.value.find(
      (e) =>
        e.id !== eventId &&
        e.date === event.date &&
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

    if (event.projectId) {
      $fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        body: { end: event.end },
      }).catch(() => {
        toast.add({ title: "Failed to update event", color: "error" });
      });
    }
  }

  function createEvent(date: string, minute: number) {
    currentEvent.value = {
      id: crypto.randomUUID(),
      date,
      start: minute,
      end: minute + SLOT_DURATION,
      projectId: "",
      description: null,
    };
    currentEventOrigin.value = minute;
  }

  async function saveEvent(data: Pick<Event, "projectId" | "description">) {
    const event = selectedEvent.value!;

    const isNew = !event.projectId;

    event.projectId = data.projectId;
    event.description = data.description;

    if (isNew) {
      try {
        const created = await $fetch("/api/events", {
          method: "POST",
          body: {
            date: event.date,
            start: event.start,
            end: event.end,
            projectId: data.projectId,
            description: data.description,
          },
        });

        events.value = [
          ...events.value.filter((e) => e.id !== selectedEvent.value!.id),
          created!,
        ];
      } catch {
        toast.add({ title: "Failed to save event", color: "error" });
      }
    } else {
      try {
        await $fetch(`/api/events/${event.id}`, {
          method: "PATCH",
          body: {
            projectId: event.projectId,
            description: event.description,
          },
        });

        events.value = [
          ...events.value.filter((e) => e.id !== event.id),
          event,
        ];
      } catch {
        toast.add({ title: "Failed to update event", color: "error" });
      }
    }

    selectedEvent.value = undefined;
  }

  function unselectEvent() {
    if (selectedEvent.value && !selectedEvent.value.projectId) {
      events.value = events.value.filter(
        (e) => e.id !== selectedEvent.value!.id,
      );
    }
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
    unselectEvent,
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
