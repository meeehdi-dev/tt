<script setup lang="ts">
import type { Project } from "~/types";

const props = defineProps<{
  project: Project;
  modelValue: string;
  color: string;
  hideDelete?: boolean;
}>();
const emit = defineEmits<{
  (e: "update:modelValue" | "update:color", val: string): void;
  (e: "delete"): void;
}>();

const { getProjectEventsCount } = useProjects();

const isChecking = ref(false);
const eventsCount = ref(0);
const isPopoverOpen = ref(false);

async function handleDeleteClick() {
  if (!props.project.id) {
    emit("delete");
    return;
  }
  isChecking.value = true;
  const count = await getProjectEventsCount(props.project.id);
  eventsCount.value = count;
  isChecking.value = false;

  if (count === 0) {
    emit("delete");
    isPopoverOpen.value = false;
  } else {
    isPopoverOpen.value = true;
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <ColorPicker :model-value="color" @update:model-value="(val) => emit('update:color', val)" />
    <UInput
      :model-value="modelValue"
      class="flex-1"
      placeholder="Project name"
      @update:model-value="(val) => emit('update:modelValue', val)" />
    <UPopover v-if="!hideDelete" v-model:open="isPopoverOpen">
      <UButton
        icon="lucide:trash"
        size="xs"
        color="error"
        variant="ghost"
        :loading="isChecking"
        @click="handleDeleteClick" />
      <template v-if="eventsCount > 0" #content>
        <div class="flex flex-col gap-2 p-2">
          <span>This project has {{ eventsCount }} event(s) linked to it.<br />Do you want to keep going?</span>
          <div class="flex gap-2 place-self-end">
            <UButton color="neutral" variant="soft" @click="isPopoverOpen = false">Cancel</UButton>
            <UButton
              color="error"
              @click="
                emit('delete');
                isPopoverOpen = false;
              "
              >Delete</UButton
            >
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
