<script setup lang="ts"></script>

<template>
  <div
    v-for="time in hours.slice(0, 12)"
    :key="time.index"
    class="-translate-y-3"
  >
    {{ time.hour.toString().padStart(2, "0") }}:00
  </div>
</template>
