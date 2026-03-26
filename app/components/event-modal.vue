<script setup lang="ts">
import type { EditorToolbarItem, FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const form = useTemplateRef("form");

const { selectedEvent, unselectEvent, saveEvent } = useEvents();

// NOTE: StarterKit provides basic formatting (bold, italic, strikethrough, lists).
// Advanced features like links, images, or code block syntax highlighting may require installing external plugins.
const bubbleToolbarItems: EditorToolbarItem[][] = [
  [
    {
      kind: "mark",
      mark: "bold",
      icon: "lucide:bold",
      tooltip: { text: "Bold" },
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "lucide:italic",
      tooltip: { text: "Italic" },
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "lucide:strikethrough",
      tooltip: { text: "Strikethrough" },
    },
    {
      kind: "bulletList",
      icon: "lucide:list",
      tooltip: { text: "Bullet List" },
    },
    {
      kind: "orderedList",
      icon: "lucide:list-ordered",
      tooltip: { text: "Ordered List" },
    },
  ],
];

const schema = z.object({
  projectId: z.string().min(1),
  description: z.string().optional(),
});
type Schema = z.infer<typeof schema>;

const state = reactive<Schema>({
  projectId: "",
  description: undefined,
});

async function onSubmit(e: FormSubmitEvent<Schema>) {
  await saveEvent({
    projectId: e.data.projectId,
    description: e.data.description ?? null,
  });

  state.projectId = "";
  state.description = undefined;
}

const { projects } = useProjects();

const localProjects = computed(() => {
  const activeProjects = projects.value.filter((p) => !p.deletedAt);

  if (selectedEvent.value && selectedEvent.value.projectId) {
    const project = projects.value.find((p) => p.id === selectedEvent.value!.projectId);
    if (project && project.deletedAt) {
      return [...activeProjects, { ...project, name: `${project.name} (Archived)` }];
    }
  }
  return activeProjects;
});

const isQuickAddModalOpen = ref(false);

async function onProjectQuickAdded(projectId: string) {
  await nextTick();
  state.projectId = projectId;
}

watch(selectedEvent, () => {
  if (!selectedEvent.value) {
    state.projectId = "";
    state.description = undefined;
    return;
  }
  state.projectId = selectedEvent.value.projectId;
  state.description = selectedEvent.value.description ?? undefined;
});

const isModalOpen = computed({
  get: () => selectedEvent.value !== undefined,
  set: (val) => {
    if (!val) {
      unselectEvent();
    }
  },
});

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: () => {
      if (selectedEvent.value !== undefined) {
        form.value?.submit();
      }
    },
  },
  escape: {
    handler: () => {
      if (selectedEvent.value !== undefined) {
        unselectEvent();
      }
    },
  },
});
</script>

<template>
  <UModal
    v-model:open="isModalOpen"
    :title="selectedEvent?.id ? 'Edit event' : 'Add event'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm ref="form" :schema="schema" :state="state" :validate-on="['change']" class="space-y-4" @submit="onSubmit">
        <UFormField label="Project" name="projectId">
          <div class="flex w-full items-center gap-2">
            <UInputMenu
              v-model="state.projectId"
              :items="localProjects"
              :autofocus="selectedEvent?.id === ''"
              value-key="id"
              label-key="name"
              :trailing-icon="false"
              class="flex-1"
              placeholder="Select a project"
            />
            <UButton icon="lucide:plus" variant="soft" color="neutral" @click="isQuickAddModalOpen = true" />
          </div>
        </UFormField>
        <UFormField label="Description" name="description">
          <UEditor
            v-slot="{ editor }"
            v-model="state.description"
            :autofocus="selectedEvent?.id !== ''"
            content-type="markdown"
            :ui="{
              root: 'ring-accented w-full rounded-md ring ring-inset',
              base: 'sm:px-2.5 sm:py-1.5',
            }"
          >
            <UEditorToolbar :editor="editor" :items="bubbleToolbarItems" layout="bubble" />
          </UEditor>
        </UFormField>
      </UForm>
      <QuickAddProjectModal v-model:open="isQuickAddModalOpen" @saved="onProjectQuickAdded" />
    </template>

    <template #footer>
      <UButton color="neutral" variant="soft" @click="unselectEvent">Cancel</UButton>
      <UPopover mode="hover">
        <UButton type="submit" @click="form?.submit()"> Save </UButton>
        <template #content>
          <div class="flex items-center gap-0.5 p-0.5">
            <UKbd value="meta" variant="soft" />
            <UKbd value="enter" variant="soft" />
          </div>
        </template>
      </UPopover>
    </template>
  </UModal>
</template>
