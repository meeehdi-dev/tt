<script setup lang="ts">
import type { Project } from "~/types";
import { StartOfWeekDay } from "~/types";

enum SettingsTab {
  General = "general",
  Projects = "projects",
}

const isOpen = defineModel<boolean>();

const { startOfWeekDay, startOfDay, endOfDay, workDayDuration } = useDate();
const { projects, createProject, updateProject, deleteProject } = useProjects();

const activeDbProjectsCount = computed(() => {
  return projects.value.filter((p) => !p.deletedAt).length;
});

const tabItems = computed(() => [
  {
    label: "General",
    value: SettingsTab.General,
    icon: "lucide:calendar",
  },
  {
    label: "Projects",
    value: SettingsTab.Projects,
    icon: "lucide:folder",
    badge: activeDbProjectsCount.value,
  },
]);

const localStartOfWeekDay = ref<StartOfWeekDay>(startOfWeekDay.value);
const localStartOfDay = ref<number>(startOfDay.value);
const localEndOfDay = ref<number>(endOfDay.value);
const localWorkDayDuration = ref<number>(workDayDuration.value / 60);
const localProjects = ref<Project[]>([]);
const activeTab = ref(SettingsTab.General);

const startOfWeekOptions = [
  { label: "Saturday", value: StartOfWeekDay.Saturday },
  { label: "Sunday", value: StartOfWeekDay.Sunday },
  { label: "Monday", value: StartOfWeekDay.Monday },
];

const timeOptions = Array.from({ length: 25 }, (_, i) => ({
  label: `${i.toString().padStart(2, "0")}:00`,
  value: i * 60,
}));

let originalProjects: Project[] = [];

function onCancel() {
  localStartOfWeekDay.value = startOfWeekDay.value;
  localStartOfDay.value = startOfDay.value;
  localEndOfDay.value = endOfDay.value;
  localWorkDayDuration.value = workDayDuration.value / 60;
  localProjects.value = JSON.parse(JSON.stringify(projects.value));
  isOpen.value = false;
}

async function onSave() {
  startOfWeekDay.value = localStartOfWeekDay.value;
  startOfDay.value = localStartOfDay.value;
  endOfDay.value = localEndOfDay.value;
  workDayDuration.value = localWorkDayDuration.value * 60;

  const newProjects = localProjects.value.filter((p) => !p.id && p.name.trim());
  const deletedProjects = originalProjects.filter((op) => !localProjects.value.some((lp) => lp.id === op.id));
  const renamedProjects = localProjects.value.filter((lp) => {
    if (!lp.id) return false;
    const original = originalProjects.find((op) => op.id === lp.id);
    return original && original.name !== lp.name && lp.name.trim();
  });

  await Promise.all([
    ...newProjects.map((p) => createProject(p.name)),
    ...deletedProjects.map((p) => deleteProject(p.id)),
    ...renamedProjects.map((p) => updateProject(p.id, p.name)),
  ]);

  isOpen.value = false;
}

watch(isOpen, (open) => {
  if (open) {
    localStartOfWeekDay.value = startOfWeekDay.value;
    localStartOfDay.value = startOfDay.value;
    localEndOfDay.value = endOfDay.value;
    localWorkDayDuration.value = workDayDuration.value / 60;
    localProjects.value = JSON.parse(JSON.stringify(projects.value.filter((p) => !p.deletedAt)));
    originalProjects = JSON.parse(JSON.stringify(projects.value.filter((p) => !p.deletedAt)));
  }
});

async function addProject() {
  localProjects.value.push({ id: "", name: "" });
}

async function removeProject(index: number) {
  localProjects.value.splice(index, 1);
}

const isValid = computed(() => localEndOfDay.value > localStartOfDay.value);

function updateProjectName(index: number, name: string) {
  const project = localProjects.value[index]!;
  project.name = name;
}
</script>

<template>
  <UModal v-model:open="isOpen" title="Settings" :ui="{ footer: 'justify-end' }" :close="{ onClick: onCancel }">
    <template #body>
      <UForm class="space-y-4">
        <UTabs v-model="activeTab" :items="tabItems" class="w-full">
          <template #content="{ item }">
            <div v-if="item.value === SettingsTab.General" class="space-y-4 pt-4">
              <UFormField label="Start of the week">
                <USelect v-model="localStartOfWeekDay" :items="startOfWeekOptions" class="w-full" />
              </UFormField>

              <UFormField label="Start/End time" :ui="{ container: 'flex gap-2' }" :error="!isValid">
                <USelect v-model="localStartOfDay" :items="timeOptions.slice(0, -1)" class="w-full" />
                <USelect v-model="localEndOfDay" :items="timeOptions.slice(1)" class="w-full" />
              </UFormField>

              <UFormField label="Work day duration">
                <UInputNumber v-model="localWorkDayDuration" class="w-full" :min="1" :max="24" />
              </UFormField>
            </div>

            <div v-else-if="item.value === SettingsTab.Projects" class="space-y-4 pt-4">
              <div v-if="localProjects.length === 0" class="text-sm text-neutral-500">No projects added yet.</div>
              <div v-for="(project, index) in localProjects" :key="index">
                <ProjectListItem
                  :project="project"
                  :model-value="project.name"
                  @update:model-value="(val) => updateProjectName(index, val)"
                  @delete="removeProject(index)" />
              </div>
              <UButton icon="lucide:plus" variant="soft" label="Add a project" @click="addProject" />
            </div>
          </template>
        </UTabs>
      </UForm>
    </template>

    <template #footer>
      <UButton color="neutral" variant="soft" @click="onCancel"> Cancel </UButton>
      <UButton :disabled="!isValid" @click="onSave"> Save </UButton>
    </template>
  </UModal>
</template>
