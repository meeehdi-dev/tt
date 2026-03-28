<script setup lang="ts">
interface PieSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

const props = defineProps<{
  data: PieSlice[];
  total: number;
}>();

/**
 * Computes the SVG path and metadata for each slice.
 * We calculate the cumulative angle for each slice to place it correctly.
 */
const slices = computed(() => {
  let currentAngle = 0;

  return props.data.map((item) => {
    // Percentage of the total
    const percentage = item.value / props.total;
    // Calculate angle in degrees
    const sliceAngle = percentage * 360;

    // Store path info
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    // Update angle for the next slice
    currentAngle += sliceAngle;

    return {
      ...item,
      path: getSlicePath(startAngle, endAngle),
    };
  });
});

function getSliceTimeLabel(slice: PieSlice) {
  return getTimeLabel(slice.value);
}
</script>

<template>
  <svg viewBox="-1 -1 2 2" class="h-full w-full -rotate-90 transform" role="img" aria-label="Project time breakdown">
    <!-- 
      - viewBox="-1 -1 2 2" centers the pie and gives it a radius of 1.
      - transform="-rotate-90" ensures the first slice starts at the 12 o'clock position.
    -->
    <g v-for="slice in slices" :id="`project-slice-${slice.id}`" :key="slice.id">
      <path :d="slice.path" :fill="slice.color" />
      <!-- Native accessibility tooltip on hover -->
      <title>{{ slice.label }}: {{ getSliceTimeLabel(slice) }}</title>
    </g>
  </svg>
</template>
