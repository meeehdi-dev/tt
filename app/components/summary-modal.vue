<script setup lang="ts">
const isOpen = defineModel<boolean>("open");
const { currentWeek } = useDate();

const { open, isSummaryModalOpen, close } = useModal();

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

const { getProjectName, getProjectColor } = useProjects();
const { startOfWeekDay } = useDate();

function previousPeriod() {
  currentDate.value = currentDate.value.subtract(1, selectedTab.value);
}

function nextPeriod() {
  currentDate.value = currentDate.value.add(1, selectedTab.value);
}

const startDate = computed(() => {
  if (selectedTab.value === Tab.Week) {
    return getStartOfWeek(currentDate.value, startOfWeekDay.value);
  }

  return currentDate.value.startOf(selectedTab.value);
});
const endDate = computed(() => {
  if (selectedTab.value === Tab.Week) {
    return getEndOfWeek(currentDate.value, startOfWeekDay.value);
  }

  return currentDate.value.endOf(selectedTab.value);
});

const { data: events, status } = useAsyncData(
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
    server: false,
  },
);

const projectTotals = computed(() => groupEventsByProject(events.value));
const totalTime = computed(() => projectTotals.value.reduce((sum, p) => sum + p.time, 0));

const chartData = computed(() =>
  projectTotals.value.map((p) => ({
    id: p.projectId,
    label: getProjectName(p.projectId),
    value: p.time,
    color: getProjectColor(p.projectId),
  })),
);

defineShortcuts({
  r: {
    handler: () => {
      open(ModalKey.Summary);
    },
  },
});
</script>

<template>
  <UModal :open="isSummaryModalOpen" title="Summary" :dismissible="false" @close:prevent="close">
    <template #body>
      <div class="flex flex-col gap-4">
        <UTabs v-model="selectedTab" :items="tabs" />

        <div class="flex items-center justify-between">
          <UButton icon="lucide:chevron-left" variant="soft" @click="previousPeriod" />
          <span class="text-sm font-medium">{{ formatPeriodLabel(currentDate, selectedTab, startOfWeekDay) }}</span>
          <UButton icon="lucide:chevron-right" variant="soft" @click="nextPeriod" />
        </div>
      </div>

      <div v-if="projectTotals.length > 0" class="grid min-h-60 grid-cols-2 items-center gap-6">
        <PieChart :data="chartData" :total="totalTime" />

        <div class="flex flex-col gap-2">
          <div v-if="status === 'pending'" class="text-sm text-gray-500">
            <UIcon name="lucide:loader-circle" class="animate-spin" />
          </div>
          <div v-else class="flex flex-col gap-2">
            <div v-for="project in projectTotals" :key="project.projectId" class="flex items-center justify-between">
              <UBadge variant="soft" class="flex items-center gap-1.5 text-sm">
                <div
                  class="size-2.5 rounded-full"
                  :style="{
                    backgroundColor: getProjectColor(project.projectId),
                  }"
                />

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
        </div>
      </div>
      <div v-else class="text-muted flex min-h-60 flex-col items-center justify-center gap-2">
        <UIcon name="lucide:circle-off" />
        No data on this period
      </div>
    </template>
  </UModal>
</template>
