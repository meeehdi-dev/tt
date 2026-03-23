<script setup lang="ts">
const { currentWeek, setPreviousWeek, setNextWeek, startOfWeekDay } = useDate();
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton icon="lucide:chevron-left" variant="soft" size="sm" @click="setPreviousWeek()" />
    <span class="text-muted text-sm">
      {{ formatPeriodLabel(currentWeek, "week", startOfWeekDay) }}
    </span>
    <UButton icon="lucide:chevron-right" variant="soft" size="sm" @click="setNextWeek" />
  </div>
</template>
