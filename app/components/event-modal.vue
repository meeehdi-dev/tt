<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const form = useTemplateRef("form");

const { selectedEvent, cancelEvent, saveEvent } = useEvents();

const schema = z.object({
  project: z.string().min(1),
  description: z.string(),
});
type Schema = z.infer<typeof schema>;

const state = reactive<Schema>({
  project: "",
  description: "",
});

function onSubmit(e: FormSubmitEvent<Schema>) {
  saveEvent(selectedEvent.value!.id, e.data);

  state.project = "";
  state.description = "";
}

const { projects } = useProjects();

watch(selectedEvent, () => {
  if (!selectedEvent.value) {
    return;
  }

  state.project = selectedEvent.value.project;
  state.description = selectedEvent.value.description;
});
</script>

<template>
  <UModal
    :open="selectedEvent !== undefined"
    :title="selectedEvent?.id ? 'Edit event' : 'Add event'"
    :ui="{ footer: 'justify-end' }"
    :close="{ onClick: () => cancelEvent() }"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Project" name="project">
          <UInputMenu
            v-model="state.project"
            :items="projects"
            value-key="value"
            label-key="label"
            :trailing-icon="false"
            class="w-full"
            placeholder="Select a project"
          />
        </UFormField>
        <UFormField label="Description" name="description">
          <UTextarea
            v-model="state.description"
            class="w-full"
            placeholder="What did you work on?"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <UButton color="neutral" variant="soft" @click="cancelEvent()"
        >Cancel</UButton
      >
      <UButton type="submit" @click="form?.submit()">Save</UButton>
    </template>
  </UModal>
</template>
