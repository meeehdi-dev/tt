<script setup lang="ts">
import { days, WEEK_START, WEEK_END } from "@/util";
import { useEvents } from "@/compasables/useEvents";
import AppEventsSummaryItem from "./AppEventsSummaryItem.vue";

const { events } = defineProps<{
  events: ReturnType<typeof useEvents>;
}>();
</script>

<template>
  <div :class="`ml-10 grid grid-cols-${WEEK_END - WEEK_START + 1}`">
    <div
      v-bind:key="day"
      v-for="day in days"
    >
      <AppEventsSummaryItem :events="events.data" :day="day" />
    </div>
  </div>
</template>
