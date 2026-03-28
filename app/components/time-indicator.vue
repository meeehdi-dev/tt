<script setup lang="ts">
const { startOfDay, endOfDay } = useDate();

const times = computed(() => hours.slice(startOfDay.value / 60, endOfDay.value / 60));
</script>

<template>
  <div v-for="time in times" :key="time" class="-translate-y-2 text-xs">
    {{
      Math.floor(time / 60)
        .toString()
        .padStart(2, "0")
    }}:00
  </div>
</template>
