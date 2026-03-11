<script setup lang="ts">
import type { Day, Event } from "~/types";

const { day, events } = defineProps<{ day: Day; events: Event[] }>();

const dayEvents = computed(() => events.filter((e) => e.day === day));

const dayTime = computed(() =>
  dayEvents.value.reduce((sum, e) => sum + getEventTime(e), 0),
);

const dayTimeLabel = computed(() => getTimeLabel(dayTime.value));
</script>

<template>
  <div class="rounded-sm h-full bg-neutral-800 overflow-hidden flex relative">
    <div class="absolute left-1/2 top-1/2 flex justify-center items-center">
      <UPopover arrow>
        <UBadge
          class="absolute cursor-pointer text-sm"
          variant="soft"
          icon="lucide:clock"
          ><span class="whitespace-nowrap">{{ dayTimeLabel }} hrs</span></UBadge
        >
        <template #content
          ><div class="p-1 pr-2 bg-neutral-900 rounded-xl flex flex-col gap-1">
            <DayProgressEvent
              v-for="event in dayEvents"
              :key="`${day}-progress-${event.id}`"
              :event="event"
            />
          </div>
        </template>
      </UPopover>
    </div>
    <DayProgressBar :time="dayTime" />
  </div>
</template>
