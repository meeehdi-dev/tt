<script setup lang="ts">
const isOpen = defineModel<boolean>("open");

const { events } = useEvents();
const { getProjectName } = useProjects();

const projectTotals = computed(() => groupEventsByProject(events.value));

const totalTime = computed(() => projectTotals.value.reduce((sum, p) => sum + p.time, 0));
</script>

<template>
  <UModal v-model:open="isOpen" title="Week Summary">
    <template #body>
      <div class="flex flex-col gap-2">
        <div v-for="project in projectTotals" :key="project.projectId" class="flex items-center justify-between gap-2">
          <UBadge variant="soft">
            {{ getProjectName(project.projectId) }}
          </UBadge>
          <span class="text-sm">
            {{ getTimeLabel(project.time) }}
          </span>
        </div>
        <USeparator class="my-2" />
        <div class="flex items-center justify-between font-bold">
          <span class="text-sm">Total</span>
          <span class="text-sm">
            {{ getTimeLabel(totalTime) }}
          </span>
        </div>
      </div>
    </template>
  </UModal>
</template>
