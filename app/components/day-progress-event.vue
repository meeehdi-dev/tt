<script setup lang="ts">
import type { Event } from "~/types";

const { event } = defineProps<{ event: Event }>();

const { getProjectLabel } = useProjects();

const eventTime = computed(() => getEventTime(event));
</script>

<template>
  <div class="flex items-center gap-2">
    <UBadge variant="soft">
      {{ getProjectLabel(event.project) }}
    </UBadge>
    <span class="text-sm">
      {{ getTimeLabel(eventTime) }}
      hrs
    </span>
  </div>
</template>
