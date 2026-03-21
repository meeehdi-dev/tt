<script setup lang="ts">
const { startOfDay, endOfDay } = useDate();
</script>

<template>
  <div v-for="time in hours.slice(startOfDay / 60, endOfDay / 60)" :key="time" class="-translate-y-2 text-xs">
    {{
      Math.floor(time / 60)
        .toString()
        .padStart(2, "0")
    }}:00
  </div>
</template>
