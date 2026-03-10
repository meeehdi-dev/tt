import type { ShallowRef } from "vue";
import type { Event } from "~/types";
import { getSlotFromElement } from "~/utils";

interface UseEventsProps {
  target: ShallowRef<HTMLElement | null>;
}

export default function useEvents({ target }: UseEventsProps) {
  const events = ref<Event[]>([]);

  const currentEvent = ref<Event>();
  const selectedEvent = ref<Event>();
  const toast = useToast();

  function reset() {
    currentEvent.value = undefined;
  }

  useMousePressed({
    target,
    onPressed: (e) => {
      const eventTarget = e.target as HTMLElement;

      const slot = getSlotFromElement(eventTarget);
      if (!slot) {
        return;
      }

      const day = Number(eventTarget.dataset.day);

      currentEvent.value = {
        id: crypto.randomUUID(),
        day,
        start: slot,
        end: slot,
        source: slot,
        project: "",
        description: "",
      };
    },
    onReleased: () => {
      if (!currentEvent.value) {
        return;
      }

      if (
        events.value.filter(
          (e) =>
            e.day === currentEvent.value!.day &&
            e.start.index >= currentEvent.value!.start.index &&
            e.end.index <= currentEvent.value!.end.index,
        ).length > 0
      ) {
        // TODO: move to separate callback
        toast.add({
          title: "Unable to create event",
          description: "An event already exists in that timespan",
          color: "error",
        });
      } else {
        events.value.push(currentEvent.value);
        selectedEvent.value = currentEvent.value;
      }

      reset();
    },
  });

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

  return {
    events,
    currentEvent,
    selectedEvent,
    onSlotHover,
  };
}
