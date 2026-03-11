<script setup lang="ts">
import type { Event, Slot } from "~/types";

const { day, time, currentEvent } = defineProps<{
  day: number;
  time: Slot;
  currentEvent: Event | undefined;
}>();

const emit = defineEmits<{ slotHover: [MouseEvent] }>();
</script>

<template>
  <div
    :data-slot="time.index"
    :data-day="day"
    class="cursor-pointer rounded-sm border-y-2 border-neutral-900 transition-colors hover:bg-neutral-700"
    :class="{
      'bg-neutral-700!':
        currentEvent &&
        day === currentEvent.day &&
        time.index >= currentEvent.start.index &&
        time.index <= currentEvent.end.index,
      'bg-neutral-800/50': day > 0 && day < 6, // Monday to Friday
      'bg-neutral-800/30': day === 0 || day === 6,
    }"
    @mouseover="
      (e) => {
        emit('slotHover', e);
      }
    "
  />
</template>
