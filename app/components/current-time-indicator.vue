<script setup lang="ts">
import dayjs from "dayjs";

const { date, dayHeight } = defineProps<{
  date: string;
  dayHeight: number;
}>();

const { now, startOfDay, endOfDay } = useDate();

const currentTime = computed(() => now.value.hour() * 60 + now.value.minute());

const currentDayNowIndicatorTranslate = computed(() =>
  Math.round(((currentTime.value - startOfDay.value) / (endOfDay.value - startOfDay.value)) * dayHeight),
);

const isToday = computed(() => date === dayjs().format("YYYY-MM-DD"));
</script>

<template>
  <USeparator
    v-if="isToday && currentTime > startOfDay && currentTime < endOfDay"
    color="primary"
    decorative
    class="pointer-events-none absolute z-10 translate-y-(--translate-y)"
    :style="{
      '--translate-y': `calc(${currentDayNowIndicatorTranslate}px - 50%)`,
    }"
    :ui="{
      container: 'm-0',
    }">
    <UBadge :label="now.format('HH:mm:ss')" color="primary" size="sm" variant="subtle" />
  </USeparator>
</template>
