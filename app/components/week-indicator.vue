<script setup lang="ts">
const { currentWeek, setPreviousWeek, setNextWeek, startOfWeekDay } = useDate();

defineShortcuts({
  h: {
    handler: setPreviousWeek,
  },
  arrowleft: {
    handler: setPreviousWeek,
  },
  l: {
    handler: setNextWeek,
  },
  arrowright: {
    handler: setNextWeek,
  },
});

const periodLabel = computed(() => formatPeriodLabel(currentWeek.value, "week", startOfWeekDay.value));
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton icon="lucide:chevron-left" variant="soft" size="sm" @click="setPreviousWeek()" />
    <span class="text-muted text-sm">
      {{ periodLabel }}
    </span>
    <UButton icon="lucide:chevron-right" variant="soft" size="sm" @click="setNextWeek" />
  </div>
</template>
