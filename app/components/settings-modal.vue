<script setup lang="ts">
import { StartOfWeekDay } from "~/types";
import type { Project } from "~/composables/useProjects";

import slugify from "slugify";

const isOpen = defineModel<boolean>();

const { startOfWeekDay } = useDate();
const { projects } = useProjects();

const localStartOfWeekDay = ref<StartOfWeekDay>(startOfWeekDay.value);
const localProjects = ref<Project[]>([]);
const inputRefs = ref<Array<{ inputRef: HTMLInputElement } | null>>([]);

const startOfWeekOptions = [
  { label: "Saturday", value: StartOfWeekDay.Saturday },
  { label: "Sunday", value: StartOfWeekDay.Sunday },
  { label: "Monday", value: StartOfWeekDay.Monday },
];

function onCancel() {
  localStartOfWeekDay.value = startOfWeekDay.value;
  localProjects.value = JSON.parse(JSON.stringify(projects.value));
  isOpen.value = false;
}

function onSave() {
  startOfWeekDay.value = localStartOfWeekDay.value;
  // Filter out any projects with empty values just in case
  projects.value = localProjects.value.filter((p) => p.value.trim() !== "");
  isOpen.value = false;
}

watch(isOpen, (open) => {
  if (open) {
    localStartOfWeekDay.value = startOfWeekDay.value;
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
      <div class="space-y-4">
        <UFormField label="Start of the week">
          <USelect
            v-model="localStartOfWeekDay"
            :items="startOfWeekOptions"
            class="w-full"
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
      </div>
    </template>

    <template #footer>
      <UButton color="neutral" variant="soft" @click="onCancel">
        Cancel
      </UButton>
      <UButton @click="onSave"> Save </UButton>
    </template>
  </UModal>
</template>
