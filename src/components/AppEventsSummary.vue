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
      :class="[
        'group/summary text-slate-600 flex flex-row gap-1 justify-center items-center relative text-xs p-1',
        {
          'cursor-pointer hover:text-slate-400':
            events.data.value.filter((a) => a.day === day).length > 0,
        },
      ]"
    >
      <AppEventsSummaryItem :events="events.data" :day="day" />
    </div>
  </div>
</template>
