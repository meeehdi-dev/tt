<script setup lang="ts">
const isOpen = defineModel<boolean>("open");

const { events } = useEvents();
const { getProjectName } = useProjects();

const projectTotals = computed(() => {
  const totals = new Map<string, number>();

  for (const event of events.value) {
    const duration = getEventTime(event);
    totals.set(event.projectId, (totals.get(event.projectId) || 0) + duration);
  }

  return Array.from(totals.entries())
    .map(([projectId, time]) => ({ projectId, time }))
    .sort((a, b) => b.time - a.time);
});

const totalTime = computed(() =>
  projectTotals.value.reduce((sum, p) => sum + p.time, 0),
);
</script>

<template>
  <UModal v-model:open="isOpen" title="Week Summary">
    <template #body>
      <div class="flex flex-col gap-2">
        <div
          v-for="project in projectTotals"
          :key="project.projectId"
          class="flex items-center justify-between gap-2"
        >
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
