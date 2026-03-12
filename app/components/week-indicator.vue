<script setup lang="ts">
import type { Dayjs } from "dayjs";

const { currentWeek, startOfWeek, endOfWeek, setPreviousWeek, setNextWeek } =
  useDate();

function getWeekLabel(date: Dayjs) {
  return date.toDate().toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
  });
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      icon="lucide:chevron-left"
      variant="soft"
      size="sm"
      @click="setPreviousWeek()"
    />
    <span class="text-muted text-sm">
      Week {{ currentWeek.isoWeek() }} |
      {{ getWeekLabel(startOfWeek) }}
      -
      {{ getWeekLabel(endOfWeek) }}
    </span>
    <UButton
      icon="lucide:chevron-right"
      variant="soft"
      size="sm"
      @click="setNextWeek"
    />
  </div>
</template>
