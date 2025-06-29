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
      height: `calc(${slotHeight * (getActivity(day, slot)?.duration ?? 0) * 2}px + ${
        0.125 * (getActivity(day, slot)?.duration ?? 0)
      }em)`,
    }"
  >
    <slot />
  </div>
</template>
