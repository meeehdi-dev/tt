<script setup lang="ts">
const { time } = defineProps<{ time: number }>();

const dayProgress = computed(
  () => (time > 16 ? (24 - time) / 8 : time / 16) * 100,
);
const overtimeProgress = computed(
  () => (time > 16 ? (time - 16) / 8 : 0) * 100,
);
</script>

<template>
  <div
    class="h-full w-(--day-progress) bg-neutral-700 transition-[width]"
    :style="{
      '--day-progress': dayProgress + '%',
    }"
  />
  <div
    class="h-full w-(--overtime-progress) bg-primary-500/30 transition-[width]"
    :style="{
      '--overtime-progress': overtimeProgress + '%',
    }"
  />
</template>
