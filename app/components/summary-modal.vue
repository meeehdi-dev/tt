<script setup lang="ts">
import { formatPeriodLabel, getEndOfWeek, getStartOfWeek } from "~/utils/date";

const isOpen = defineModel<boolean>("open");
const { currentWeek } = useDate();

enum Tab {
  Week = "week",
  Month = "month",
  Year = "year",
}

const tabs = [
  { label: "Week", value: Tab.Week },
  { label: "Month", value: Tab.Month },
  { label: "Year", value: Tab.Year },
];

const selectedTab = ref(tabs[0]!.value);
const currentDate = ref(currentWeek.value);

watch(
  isOpen,
  (open) => {
    if (open) {
      currentDate.value = currentWeek.value;
    }
  },
  { immediate: true },
);

const { getProjectName } = useProjects();
const { startOfWeekDay } = useDate();

function previousPeriod() {
  currentDate.value = currentDate.value.subtract(1, selectedTab.value);
}

function nextPeriod() {
  currentDate.value = currentDate.value.add(1, selectedTab.value);
}

const startDate = computed(() => {
  if (selectedTab.value === Tab.Week) return getStartOfWeek(currentDate.value, startOfWeekDay.value);
  return currentDate.value.startOf(selectedTab.value);
});
const endDate = computed(() => {
  if (selectedTab.value === Tab.Week) return getEndOfWeek(currentDate.value, startOfWeekDay.value);
  return currentDate.value.endOf(selectedTab.value);
});

const { data: events, status } = useAsyncData(
  "summary-events",
  () =>
    $fetch("/api/events", {
      query: {
        startDate: startDate.value.format("YYYY-MM-DD"),
        endDate: endDate.value.format("YYYY-MM-DD"),
      },
    }),
  {
    watch: [startDate, endDate],
    default: () => [],
  },
);

const projectTotals = computed(() => groupEventsByProject(events.value));
const totalTime = computed(() => projectTotals.value.reduce((sum, p) => sum + p.time, 0));
</script>

<template>
  <UModal v-model:open="isOpen" title="Summary">
    <template #body>
      <div class="flex flex-col gap-4">
        <UTabs v-model="selectedTab" :items="tabs" />

        <div class="flex items-center justify-between">
          <UButton icon="lucide:chevron-left" variant="soft" @click="previousPeriod" />
          <span class="text-sm font-medium">{{ formatPeriodLabel(currentDate, selectedTab, startOfWeekDay) }}</span>
          <UButton icon="lucide:chevron-right" variant="soft" @click="nextPeriod" />
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-6">
        <div
          class="flex min-h-50 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <span class="text-sm text-gray-500">Pie Chart Placeholder</span>
        </div>

        <div class="flex flex-col gap-2">
          <div v-if="status === 'pending'" class="text-sm text-gray-500">
            <UIcon name="lucide:loader-circle" class="animate-spin" />
          </div>
          <template v-else>
            <div v-if="projectTotals.length === 0" class="flex flex-col items-center gap-2">
              <UIcon name="lucide:circle-off" />
              No project on this period
            </div>
            <div v-else class="flex flex-col gap-2">
              <div v-for="project in projectTotals" :key="project.projectId" class="flex justify-between">
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
        </div>
      </div>
    </template>
  </UModal>
</template>
