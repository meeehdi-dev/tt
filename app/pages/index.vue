<script setup lang="ts">
import { useElementSize } from "@vueuse/core";

useSeoMeta({
  title: "Calendar",
});

const weekRef = useTemplateRef("week");

const { height: weekHeight } = useElementSize(weekRef);

const { days } = useDate();

const { events, currentEvent, onSlotHover, addEvent, createEvent } =
  useEvents();

useMousePressed({
  target: weekRef,
  onPressed: (e) => {
    const eventTarget = e.target as HTMLElement;

    const slot = getSlotFromElement(eventTarget);
    if (!slot) {
      return;
    }

    const day = Number(eventTarget.dataset.day);

    createEvent(day, slot);
  },
  onReleased: () => {
    if (!currentEvent.value) {
      return;
    }

    addEvent();
  },
});
</script>

<template>
  <div class="flex h-screen w-screen flex-col gap-1">
    <Header />
    <div class="flex h-full w-full gap-1 px-1">
      <div class="grid h-full grid-rows-12">
        <TimeIndicator />
      </div>
      <div ref="week" class="grid h-full w-full grid-cols-7 gap-1">
        <div
          v-for="day in days"
          :key="day"
          class="relative grid h-full rounded-sm"
        >
          <CurrentTimeIndicator :day="day" :day-height="weekHeight" />
          <DaySlot
            v-for="time in availableSlots"
            :id="`slot-${day}-${time.index}`"
            :key="`${day}-${time.index}`"
            :day="day"
            :time="time"
            :current-event="currentEvent"
            @slot-hover="onSlotHover"
          />
          <div
            class="pointer-events-none absolute grid h-full w-full grid-rows-24 gap-1"
          >
            <Event
              v-for="event in events.filter((e) => e.day === day)"
              :key="`${day}-${event.id}`"
              :event="event"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="flex min-h-8 w-full gap-1 px-1 pb-1">
      <div class="-translate-y-4 text-xs">20:00</div>
      <div class="grid w-full grid-cols-7 gap-1">
        <DayProgress
          v-for="day in days"
          :key="`${day}-progress`"
          :day="day"
          :events="events"
        />
      </div>
    </div>
    <EventModal />
  </div>
</template>
