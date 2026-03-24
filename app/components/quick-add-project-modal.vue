<script setup lang="ts">
import type { FetchError } from "ofetch";
const isOpen = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ (e: "saved", projectId: string): void }>();
const { createProject, restoreProject } = useProjects();
const toast = useToast();

const state = ref({ id: "", name: "", color: "#f59e0b" });
const isConfirmModalOpen = ref(false);
const confirmMessage = ref("");
let confirmResolve: ((value: boolean) => void) | null = null;

async function askConfirmation(message: string) {
  confirmMessage.value = message;
  isConfirmModalOpen.value = true;
  return new Promise<boolean>((resolve) => {
    confirmResolve = resolve;
  });
}

function handleConfirm() {
  if (confirmResolve) confirmResolve(true);
}

function handleCancel() {
  if (confirmResolve) confirmResolve(false);
}

async function onSave() {
  if (!state.value.name.trim()) return;
  try {
    const created = await createProject(state.value.name, state.value.color);
    emit("saved", created.id);
    isOpen.value = false;
    state.value = { id: "", name: "", color: "#f59e0b" };
  } catch (err) {
    const error = err as FetchError;
    if (error.response?.status === 409) {
      const archivedId = error.response._data.data.archivedId;
      const shouldRestore = await askConfirmation(
        `An archived project named "${state.value.name}" already exists. Would you like to restore it?`,
      );
      if (shouldRestore) {
        const restored = await restoreProject(archivedId, state.value.name, state.value.color);
        emit("saved", restored.id);
        isOpen.value = false;
        state.value = { id: "", name: "", color: "#f59e0b" };
      }
    } else {
      toast.add({
        title: "Error",
        description: error.response?._data?.statusMessage || "Failed to create project",
        color: "error",
      });
    }
  }
}
</script>

<template>
  <UModal v-model:open="isOpen" title="Add Project" :ui="{ footer: 'justify-end' }">
    <template #body>
      <ProjectListItem
        v-model="state.name"
        :project="state"
        :color="state.color"
        hide-delete
        @update:color="(val) => (state.color = val)" />
    </template>
    <template #footer>
      <UButton color="neutral" variant="soft" @click="isOpen = false">Cancel</UButton>
      <UButton :disabled="!state.name.trim()" @click="onSave">Save</UButton>
    </template>
  </UModal>

  <ConfirmModal
    v-model:open="isConfirmModalOpen"
    title="Project Already Exists"
    :message="confirmMessage"
    confirm-text="Restore Project"
    @confirm="handleConfirm"
    @cancel="handleCancel" />
</template>
