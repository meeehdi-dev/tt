<script setup lang="ts">
import type { Project } from "~/composables/use-projects";
import { StartOfWeekDay } from "~/types";

import slugify from "slugify";

const isOpen = defineModel<boolean>();

const { startOfWeekDay, startOfDay, endOfDay, workDayDuration } = useDate();
const { projects } = useProjects();

const localStartOfWeekDay = ref<StartOfWeekDay>(startOfWeekDay.value);
const localStartOfDay = ref<number>(startOfDay.value);
const localEndOfDay = ref<number>(endOfDay.value);
const localWorkDayDuration = ref<number>(workDayDuration.value / 60);
const localProjects = ref<Project[]>([]);
const inputRefs = ref<Array<{ inputRef: HTMLInputElement } | null>>([]);

const startOfWeekOptions = [
  { label: "Saturday", value: StartOfWeekDay.Saturday },
  { label: "Sunday", value: StartOfWeekDay.Sunday },
  { label: "Monday", value: StartOfWeekDay.Monday },
];

const timeOptions = Array.from({ length: 25 }, (_, i) => ({
  label: `${i.toString().padStart(2, "0")}:00`,
  value: i * 60,
}));

function onCancel() {
  localStartOfWeekDay.value = startOfWeekDay.value;
  localStartOfDay.value = startOfDay.value;
  localEndOfDay.value = endOfDay.value;
  localWorkDayDuration.value = workDayDuration.value / 60;
  localProjects.value = JSON.parse(JSON.stringify(projects.value));
  isOpen.value = false;
}

function onSave() {
  startOfWeekDay.value = localStartOfWeekDay.value;
  startOfDay.value = localStartOfDay.value;
  endOfDay.value = localEndOfDay.value;
  workDayDuration.value = localWorkDayDuration.value * 60;
  // Filter out any projects with empty values just in case
  projects.value = localProjects.value.filter((p) => p.value.trim() !== "");
  isOpen.value = false;
}

watch(isOpen, (open) => {
  if (open) {
    localStartOfWeekDay.value = startOfWeekDay.value;
    localStartOfDay.value = startOfDay.value;
    localEndOfDay.value = endOfDay.value;
    localWorkDayDuration.value = workDayDuration.value / 60;
    localProjects.value = JSON.parse(JSON.stringify(projects.value));
  }
});

async function addProject() {
  localProjects.value.push({ label: "", value: "" });

  await nextTick();

  const newIndex = localProjects.value.length - 1;
  const lastInputComponent = inputRefs.value[newIndex];

  if (lastInputComponent?.inputRef) {
    lastInputComponent.inputRef.focus();
  }
}

function removeProject(index: number) {
  localProjects.value.splice(index, 1);
}

const isValid = computed(() => localEndOfDay.value > localStartOfDay.value);

function updateProjectLabel(index: number, label: string) {
  const project = localProjects.value[index];
  if (!project) return;
  project.label = label;
  project.value = slugify(label, {
    replacement: "_",
    lower: true,
    strict: true,
  });
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Settings"
    :ui="{ footer: 'justify-end' }"
    :close="{ onClick: onCancel }"
  >
    <template #body>
      <UForm class="space-y-4">
        <UFormField label="Start of the week">
          <USelect
            v-model="localStartOfWeekDay"
            :items="startOfWeekOptions"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Start/End time"
          :ui="{ container: 'flex gap-2' }"
          :error="!isValid"
        >
          <USelect
            v-model="localStartOfDay"
            :items="timeOptions.slice(0, -1)"
            class="w-full"
          />
          <USelect
            v-model="localEndOfDay"
            :items="timeOptions.slice(1)"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Work day duration">
          <UInputNumber
            v-model="localWorkDayDuration"
            class="w-full"
            :min="1"
            :max="24"
          />
        </UFormField>

        <USeparator />

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Projects</span>
          </div>
          <div
            v-if="localProjects.length === 0"
            class="text-sm text-neutral-500"
          >
            No projects added yet.
          </div>
          <div
            v-for="(project, index) in localProjects"
            :key="index"
            class="flex items-center gap-2"
          >
            <UInput
              ref="inputRefs"
              :model-value="project.label"
              class="flex-1"
              placeholder="Project name"
              @update:model-value="(val) => updateProjectLabel(index, val)"
            />
            <UButton
              icon="lucide:trash"
              size="xs"
              color="error"
              variant="ghost"
              @click="removeProject(index)"
            />
          </div>
          <UButton
            icon="lucide:plus"
            variant="soft"
            label="Add a project"
            @click="addProject"
          />
        </div>
      </UForm>
    </template>

    <template #footer>
      <UButton color="neutral" variant="soft" @click="onCancel">
        Cancel
      </UButton>
      <UButton :disabled="!isValid" @click="onSave"> Save </UButton>
    </template>
  </UModal>
</template>
