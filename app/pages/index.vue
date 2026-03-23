<script setup lang="ts">
import { useElementSize } from "@vueuse/core";

useSeoMeta({
  title: "Calendar",
});

const weekRef = useTemplateRef("week");

const { height: weekHeight } = useElementSize(weekRef);

const { days, startOfDay, endOfDay } = useDate();

const { events, currentEvent, onSlotHover, addEvent, createEvent } = useEvents();

const isSummaryModalOpen = ref(false);

useMousePressed({
  target: weekRef,
  onPressed: (e) => {
    const eventTarget = e.target as HTMLElement;
    if (eventTarget.dataset.group !== "slot") {
      return;
    }
    const minute = Number(eventTarget.dataset.minute);

    const date = eventTarget.dataset.date!;

    createEvent(date, minute);
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
        }">
        <TimeIndicator />
      </div>
      <div ref="week" class="grid h-full w-full grid-cols-7 gap-1">
        <div v-for="date in days" :key="date" class="relative grid h-full rounded-sm">
          <CurrentTimeIndicator :date="date" :day-height="weekHeight" />
          <DaySlot
            v-for="minute in availableSlots.slice(startOfDay / SLOT_DURATION, endOfDay / SLOT_DURATION)"
            :id="`slot-${date}-${minute}`"
            :key="`${date}-${minute}`"
            :date="date"
            :minute="minute"
            :current-event="currentEvent"
            data-group="slot"
            @slot-hover="onSlotHover" />
          <div
            class="pointer-events-none absolute grid h-full w-full grid-rows-(--grid-rows) gap-1"
            :style="{
              '--grid-rows': `repeat(${endOfDay / SLOT_DURATION - startOfDay / SLOT_DURATION}, minmax(0, 1fr))`,
            }">
            <Event v-for="event in events.filter((e) => e.date === date)" :key="`${date}-${event.id}`" :event="event" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex min-h-8 w-full gap-1 px-1 pb-1">
      <div class="flex max-h-8 -translate-y-4 flex-col">
        <div class="text-xs">{{ endOfDay / 60 }}:00</div>
        <UButton
          icon="lucide:sigma"
          variant="soft"
          class="max-h-7.5 justify-center"
          :disabled="events.length === 0"
          @click="isSummaryModalOpen = true" />
      </div>
      <div class="grid w-full grid-cols-7 gap-1">
        <DayProgress v-for="date in days" :key="`${date}-progress`" :date="date" />
      </div>
    </div>
    <EventModal />
    <SummaryModal v-model:open="isSummaryModalOpen" />
  </div>
</template>
