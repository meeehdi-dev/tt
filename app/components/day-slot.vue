<script setup lang="ts">
import type { Event } from "~/types";

const { day, minute, currentEvent } = defineProps<{
  day: number;
  minute: number;
  currentEvent: Event | undefined;
}>();

const emit = defineEmits<{ slotHover: [MouseEvent] }>();
</script>

<template>
  <div
    :data-minute="minute"
    :data-day="day"
    class="cursor-pointer rounded-sm border-y-2 border-neutral-900 transition-colors hover:bg-neutral-700"
    :class="{
      'bg-neutral-700!':
        currentEvent &&
        day === currentEvent.day &&
        minute >= currentEvent.start &&
        minute < currentEvent.end,
      'bg-neutral-800/50': day > 0 && day < 6, // Monday to Friday
      'bg-neutral-800/30': day === 0 || day === 6,
    }"
    @mouseover="emit('slotHover', $event)"
  />
</template>
