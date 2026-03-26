<script setup lang="ts">
const { date } = defineProps<{ date: string }>();

const { events } = useEvents();

const dayEvents = computed(() => events.value.filter((e) => e.date === date));
const groupedEvents = computed(() => groupEventsByProject(dayEvents.value));

const dayTime = computed(() => dayEvents.value.reduce((sum, e) => sum + getEventTime(e), 0));
</script>

<template>
  <div class="relative flex h-full overflow-hidden rounded-sm bg-neutral-800">
    <div class="absolute top-1/2 left-1/2 flex items-center justify-center">
      <UPopover mode="hover" :ui="{ content: dayTime <= 0 ? 'hidden' : undefined }">
        <UBadge class="absolute text-xs" variant="soft" icon="lucide:clock">
          <span class="whitespace-nowrap">{{ getTimeLabel(dayTime) }}</span>
        </UBadge>
        <template #content>
          <div class="flex flex-col gap-1 rounded-xl bg-neutral-900 p-1 pr-2">
            <DayProgressEvent
              v-for="group in groupedEvents"
              :key="`${date}-progress-${group.projectId}`"
              :project-id="group.projectId"
              :time="group.time"
            />
          </div>
        </template>
      </UPopover>
    </div>
    <DayProgressBar :time="dayTime" />
  </div>
</template>
