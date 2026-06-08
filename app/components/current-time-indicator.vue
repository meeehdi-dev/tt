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
  <ClientOnly>
    <div
      v-if="isToday && currentTime > startOfDay && currentTime < endOfDay"
      class="pointer-events-none absolute left-0 z-10 w-full translate-y-(--translate-y)"
      :style="{
        '--translate-y': `calc(${currentDayNowIndicatorTranslate}px - 50%)`,
      }"
    >
      <USeparator
        color="primary"
        decorative
        :ui="{
          container: 'm-0',
        }"
      >
        <UBadge :label="now.format('HH:mm:ss')" color="primary" size="sm" variant="soft" />
      </USeparator>
    </div>
  </ClientOnly>
</template>
