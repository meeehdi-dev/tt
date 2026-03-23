<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const form = useTemplateRef("form");

const { selectedEvent, unselectEvent, saveEvent } = useEvents();

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

watch(selectedEvent, () => {
  if (!selectedEvent.value) {
    state.projectId = "";
    state.description = undefined;
    return;
  }
  state.projectId = selectedEvent.value.projectId;
  state.description = selectedEvent.value.description ?? undefined;
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
    :open="selectedEvent !== undefined"
    :title="selectedEvent?.id ? 'Edit event' : 'Add event'"
    :ui="{ footer: 'justify-end' }"
    :close="{
      onClick: unselectEvent,
    }">
    <template #body>
      <UForm ref="form" :schema="schema" :state="state" :validate-on="['change']" class="space-y-4" @submit="onSubmit">
        <UFormField label="Project" name="projectId">
          <UInputMenu
            v-model="state.projectId"
            :items="localProjects"
            value-key="id"
            label-key="name"
            :trailing-icon="false"
            class="w-full"
            placeholder="Select a project" />
        </UFormField>
        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" class="w-full" placeholder="What did you work on?" />
        </UFormField>
      </UForm>
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
