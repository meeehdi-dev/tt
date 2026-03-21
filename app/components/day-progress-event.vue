<script setup lang="ts">
import type { Event } from "~/types";

const { event } = defineProps<{ event: Event }>();

const { getProjectName } = useProjects();

const eventTime = computed(() => getEventTime(event));
</script>

<template>
  <div class="flex items-center gap-2">
    <UBadge variant="soft">
      {{ getProjectName(event.projectId) }}
    </UBadge>
    <span class="text-sm">
      {{ getTimeLabel(eventTime) }}
    </span>
  </div>
</template>
