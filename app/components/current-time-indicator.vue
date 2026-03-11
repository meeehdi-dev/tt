<script setup lang="ts">
import dayjs from "dayjs";

const { day, dayHeight: weekHeight } = defineProps<{
  day: number;
  dayHeight: number;
}>();

const now = ref(dayjs());
let nowTimeout = 0;
onMounted(() => {
  nowTimeout = setInterval(() => {
    now.value = dayjs();
  }, 1000);
});
onUnmounted(() => {
  clearTimeout(nowTimeout);
});

const currentDay = now.value.day();

const currentTime = computed(() => now.value.hour() * 60 + now.value.minute());

const currentDayNowIndicatorTranslate = computed(() =>
  Math.round(((currentTime.value - 8 * 60) / (12 * 60)) * weekHeight),
);

const timeLabel = computed(() => `${now.value.format("HH:mm:ss")}`);
</script>

<template>
  <USeparator
    v-if="day === currentDay && currentTime > 8 * 60 && currentTime < 20 * 60"
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
    <UBadge :label="timeLabel" color="primary" size="sm" variant="subtle" />
  </USeparator>
</template>
