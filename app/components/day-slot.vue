<script setup lang="ts">
import dayjs from "dayjs";
import type { Event } from "~/types";

const { date, minute, currentEvent } = defineProps<{
  date: string;
  minute: number;
  currentEvent: Event | undefined;
}>();

const emit = defineEmits<{ slotHover: [MouseEvent] }>();

const dayOfWeek = computed(() => dayjs(date).day());
</script>

<template>
  <div
    :data-minute="minute"
    :data-date="date"
    class="cursor-pointer rounded-sm border-y-2 border-neutral-900 transition-colors hover:bg-neutral-700"
    :class="{
      'bg-neutral-700!':
        currentEvent && date === currentEvent.date && minute >= currentEvent.start && minute < currentEvent.end,
      'bg-neutral-800/50': dayOfWeek > 0 && dayOfWeek < 6,
      'bg-neutral-800/30': dayOfWeek === 0 || dayOfWeek === 6,
    }"
    @mouseover="emit('slotHover', $event)" />
</template>
