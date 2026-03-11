<script setup lang="ts">
import type { Dayjs } from "dayjs";
import { StartOfWeekDay } from "~/types";

// TODO: settings
const startOfWeekOffset = shallowRef(StartOfWeekDay.Monday);

const { date } = defineProps<{ date: Dayjs }>();

const emit = defineEmits<{ previous: []; next: [] }>();

const startOfWeek = computed(() =>
  date.startOf("week").add(startOfWeekOffset.value, "day"),
);
const endOfWeek = computed(() =>
  date.endOf("week").add(startOfWeekOffset.value, "day"),
);

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
      class="py-0 cursor-pointer"
      @click="emit('previous')"
    />
    <span class="text-sm text-muted">
      Week {{ date.isoWeek() }} |
      {{ getWeekLabel(startOfWeek) }}
      -
      {{ getWeekLabel(endOfWeek) }}
    </span>
    <UButton
      icon="lucide:chevron-right"
      variant="soft"
      class="py-0 cursor-pointer"
      @click="emit('next')"
    />
  </div>
</template>
