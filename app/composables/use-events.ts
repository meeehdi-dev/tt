import type { Event } from "~/types";

export default function useEvents() {
  const toast = useToast();

  const currentEvent = useState<Event | undefined>("currentEvent");
  const currentEventOrigin = useState<number | undefined>("currentEventOrigin");
  const selectedEvent = useState<Event | undefined>("selectedEvent");

  const { startOfDay, endOfDay, startOfWeek } = useDate();

  const startDate = computed(() => startOfWeek.value.format("YYYY-MM-DD"));

  const nuxtApp = useNuxtApp();
  const lastFetchedDate = useState<string>("lastFetchedDate", () => "");

  const { data: events } = useAsyncData(
    "events",
    async () => {
      const data = await $fetch("/api/events", {
        query: {
          startDate: startDate.value,
          endDate: startOfWeek.value.add(6, "day").format("YYYY-MM-DD"),
        },
      });
      lastFetchedDate.value = startDate.value;
      return data;
    },
    {
      default: () => [] as Event[],
      watch: [startDate],
      server: false,
      dedupe: "defer",
      getCachedData(key) {
        if (lastFetchedDate.value !== startDate.value) {
          return undefined; // Force refetch when navigating to a new week
        }
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      },
    },
  );

  function hasOverlap(date: string, start: number, end: number, excludeId?: string) {
    return events.value.some((e) => e.id !== excludeId && e.date === date && e.start < end && e.end > start);
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
    if (hasOverlap(currentEvent.value!.date, currentEvent.value!.start, currentEvent.value!.end)) {
      toast.add({
        title: "Unable to create event",
        description: "An event already exists in that timespan",
        color: "error",
      });
    } else if (currentEvent.value) {
      events.value.push(currentEvent.value);
      selectedEvent.value = currentEvent.value;
    }

    currentEvent.value = undefined;
    currentEventOrigin.value = undefined;
  }

  async function removeEvent(eventId: string) {
    events.value = events.value.filter((e) => e.id !== eventId);

    try {
      await $fetch(`/api/events/${eventId}`, { method: "DELETE" });
    } catch {
      toast.add({
        title: "Failed to delete event",
        color: "error",
      });
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
        (e) => e.id !== eventId && e.date === targetDate && e.start < candidateEnd && e.end > candidateStart,
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

    try {
      const updated = await $fetch<Event>(`/api/events/${eventId}`, {
        method: "PATCH",
        body: { date: targetDate, start: candidateStart, end: candidateEnd },
      });

      events.value = events.value.map((e) => (e.id === eventId ? updated : e));
    } catch {
      toast.add({ title: "Failed to update event", color: "error" });
    }
  }

  async function moveEventStart(eventId: string, minute: number) {
    const event = events.value.find((e) => e.id === eventId)!;

    const blocker = events.value.find(
      (e) => e.id !== eventId && e.date === event.date && e.start < event.end && e.end > minute,
    );

    let start = minute;
    if (blocker) {
      if (blocker.end < event.end) {
        start = blocker.end;
      } else {
        return;
      }
    }

    try {
      const updated = await $fetch<Event>(`/api/events/${eventId}`, {
        method: "PATCH",
        body: { start },
      });
      events.value = events.value.map((e) => (e.id === eventId ? updated : e));
    } catch (err) {
      const error = err as Error;
      toast.add({
        title: "Failed to update event",
        color: "error",
        description: error.message,
      });
    }
  }

  async function moveEventBottom(eventId: string, minute: number) {
    const event = events.value.find((e) => e.id === eventId)!;
    const candidateEnd = minute + SLOT_DURATION;

    const blocker = events.value.find(
      (e) => e.id !== eventId && e.date === event.date && e.start < candidateEnd && e.end > event.start,
    );

    let end = candidateEnd;
    if (blocker) {
      if (blocker.start > event.start) {
        end = blocker.start;
      } else {
        return;
      }
    }

    try {
      const updated = await $fetch<Event>(`/api/events/${eventId}`, {
        method: "PATCH",
        body: { end },
      });
      events.value = events.value.map((e) => (e.id === eventId ? updated : e));
    } catch (err) {
      const error = err as Error;
      toast.add({
        title: "Failed to update event",
        color: "error",
        description: error.message,
      });
    }
  }

  function createEvent(date: string, minute: number) {
    currentEvent.value = {
      id: "",
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
    const isNew = event.id === "";

    if (isNew) {
      try {
        const created = await $fetch<Event>("/api/events", {
          method: "POST",
          body: {
            date: event.date,
            start: event.start,
            end: event.end,
            projectId: data.projectId,
            description: data.description,
          },
        });

        events.value = [...events.value.filter((e) => e.id !== ""), created];
      } catch {
        toast.add({ title: "Failed to save event", color: "error" });
      }
    } else {
      try {
        const updated = await $fetch<Event>(`/api/events/${event.id}`, {
          method: "PATCH",
          body: {
            projectId: data.projectId,
            description: data.description,
          },
        });

        events.value = events.value.map((e) => (e.id === event.id ? updated : e));
      } catch {
        toast.add({ title: "Failed to update event", color: "error" });
      }
    }

    selectedEvent.value = undefined;
  }

  function unselectEvent() {
    if (selectedEvent.value && selectedEvent.value.id === "") {
      events.value = events.value.filter((e) => e.id !== selectedEvent.value!.id);
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
