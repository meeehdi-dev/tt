<script setup lang="ts">
const { time } = defineProps<{ time: number }>();

const { workDayDuration, startOfDay, endOfDay } = useDate();

const dayProgress = computed(() => (time <= workDayDuration.value ? (time / workDayDuration.value) * 100 : 100));

const overtimeProgress = computed(() =>
  time > workDayDuration.value ?
    ((time - workDayDuration.value) / (endOfDay.value - startOfDay.value - workDayDuration.value)) * 100
  : 0,
);
</script>

<template>
  <div
    class="h-full w-(--day-progress) bg-neutral-700 transition-[width]"
    :style="{
      '--day-progress': dayProgress - overtimeProgress + '%',
    }"
  />
  <div
    class="bg-primary-500/30 h-full w-(--overtime-progress) transition-[width]"
    :style="{
      '--overtime-progress': overtimeProgress + '%',
    }"
  />
</template>
