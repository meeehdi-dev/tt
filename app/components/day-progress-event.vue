<script setup lang="ts">
const { projectId, time } = defineProps<{ projectId: string; time: number }>();

const { getProjectName } = useProjects();
</script>

<template>
  <div class="flex items-center gap-2">
    <UBadge variant="soft">
      {{ getProjectName(projectId) }}
    </UBadge>
    <span class="text-sm">
      {{ getTimeLabel(time) }}
    </span>
  </div>
</template>
