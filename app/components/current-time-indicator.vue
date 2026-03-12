<script setup lang="ts">
const { day, dayHeight } = defineProps<{
  day: number;
  dayHeight: number;
}>();

const { now } = useDate();

const currentTime = computed(() => now.value.hour() * 60 + now.value.minute());

const currentDayNowIndicatorTranslate = computed(() =>
  Math.round(((currentTime.value - 8 * 60) / (12 * 60)) * dayHeight),
);
</script>

<template>
  <USeparator
    v-if="day === now.day() && currentTime > 8 * 60 && currentTime < 20 * 60"
    color="primary"
    decorative
    class="pointer-events-none absolute z-10 translate-y-(--translate-y)"
    :style="{
      '--translate-y': `calc(${currentDayNowIndicatorTranslate}px - 50%)`,
    }"
    :ui="{
      container: 'm-0',
    }"
  >
    <UBadge
      :label="now.format('HH:mm:ss')"
      color="primary"
      size="sm"
      variant="subtle"
    />
  </USeparator>
</template>
