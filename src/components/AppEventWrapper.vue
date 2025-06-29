<script setup lang="ts">
import type { SlotRange } from "@/util";
import type { Ref } from "vue";

const {
  events,
  day,
  time: slot,
  slotHeight,
  isGrabbingTop,
  isGrabbingBottom,
} = defineProps<{
  events: Ref<SlotRange[]>;
  day: number;
  time: number;
  slotHeight: number;
  isGrabbingTop: string;
  isGrabbingBottom: string;
}>();

function getKey(day: number, slot: number) {
  return `${day}-${slot}`;
}

function isActive(day: number, slot: number): boolean {
  const key = getKey(day, slot);
  return (
    events.value.find(({ day: d, start }) => getKey(d, start) === key) !==
    undefined
  );
}

function getActivity(day: number, slot: number) {
  const key = getKey(day, slot);
  return events.value.find(({ day: d, start }) => getKey(d, start) === key);
}

function getActivityLength(day: number, slot: number): number {
  const activitySlot = getActivity(day, slot);
  if (!activitySlot) {
    return 0;
  }

  if (activitySlot.day === -1) {
    return 1;
  }

  const start = activitySlot.start;
  const end = activitySlot.end;

  return (end - start) * 2 + 1;
}
</script>

<template>
  <div
    v-if="isActive(day, slot)"
    :class="[
      'activity absolute w-full z-10 flex flex-auto flex-col bg-slate-300 text-slate-800 rounded-xs',
      {
        'pointer-events-none':
          isGrabbingTop == getKey(day, slot) ||
          isGrabbingBottom == getKey(day, slot),
      },
    ]"
    :style="{
      height: `calc(${slotHeight * getActivityLength(day, slot)}px + ${
        0.125 * (getActivityLength(day, slot) - 1)
      }em)`,
    }"
  >
    <slot />
  </div>
</template>
