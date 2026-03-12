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

const projects = ref<string[]>(["vo2", "jda", "ri", "lvmhcom"]);

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
        <UFormField label="Title" name="title">
          <UInputMenu
            v-model="state.project"
            :items="projects"
            :trailing-icon="false"
            class="w-full"
            placeholder="Your project name"
          />
        </UFormField>
        <UFormField label="Description" name="description">
          <UTextarea
            v-model="state.description"
            class="w-full"
            placeholder="Your description"
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
