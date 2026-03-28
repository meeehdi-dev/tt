<script setup lang="ts">
const { projectId, time } = defineProps<{ projectId: string; time: number }>();

const { getProjectName } = useProjects();

const projectTimeLabel = computed(() => getTimeLabel(time));
</script>

<template>
  <div class="flex items-center gap-2">
    <UBadge variant="soft">
      {{ getProjectName(projectId) }}
    </UBadge>
    <span class="text-sm">
      {{ projectTimeLabel }}
    </span>
  </div>
</template>
