<script setup lang="ts">
import { useElementSize } from "@vueuse/core";

useSeoMeta({
  title: "Calendar",
});

const weekRef = useTemplateRef("week");

const { height: weekHeight } = useElementSize(weekRef);

const { days, startOfDay, endOfDay } = useDate();

const { events, currentEvent, onSlotHover, addEvent, createEvent } =
  useEvents();

useMousePressed({
  target: weekRef,
  onPressed: (e) => {
    const eventTarget = e.target as HTMLElement;
    if (eventTarget.dataset.group !== "slot") {
      return;
    }
    const minute = Number(eventTarget.dataset.minute);

    const day = Number(eventTarget.dataset.day);

    createEvent(day, minute);
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
      <div
        class="grid h-full grid-rows-(--grid-rows)"
        :style="{
          '--grid-rows': `repeat(${endOfDay / 60 - startOfDay / 60}, minmax(0, 1fr))`,
        }"
      >
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
            v-for="minute in availableSlots.slice(
              (startOfDay * 2) / 60,
              (endOfDay * 2) / 60,
            )"
            :id="`slot-${day}-${minute}`"
            :key="`${day}-${minute}`"
            :day="day"
            :minute="minute"
            :current-event="currentEvent"
            data-group="slot"
            @slot-hover="onSlotHover"
          />
          <div
            class="pointer-events-none absolute grid h-full w-full grid-rows-(--grid-rows) gap-1"
            :style="{
              '--grid-rows': `repeat(${(endOfDay * 2) / 60 - (startOfDay * 2) / 60}, minmax(0, 1fr))`,
            }"
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
      <div class="-translate-y-4 text-xs">{{ endOfDay / 60 }}:00</div>
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
