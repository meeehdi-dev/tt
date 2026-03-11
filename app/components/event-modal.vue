<script setup lang="ts">
import type { FormSubmitEvent, SelectMenuItem } from "@nuxt/ui";
import { z } from "zod";
import type { Event } from "~/types";

const { event } = defineProps<{ event: Event | undefined }>();

const emit = defineEmits<{ save: [Event]; cancel: [Event] }>();

const form = useTemplateRef("form");

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
  emit("save", {
    ...event!,
    project: e.data.project,
    description: e.data.description.trim(),
  });

  state.project = "";
  state.description = "";
}

const projects = ref<SelectMenuItem[]>([
  {
    label: "VO2",
    value: "vo2",
  },
  {
    label: "JDA",
    value: "jda",
  },
  {
    label: "Inside",
    value: "ri",
  },
  {
    label: "LVMHCOM",
    value: "lvmhcom",
  },
]);

watch(
  () => event,
  () => {
    if (!event) {
      return;
    }

    state.project = event.project;
    state.description = event.description;
  },
);
</script>

<template>
  <UModal
    :open="event !== undefined"
    :title="event?.id ? 'Edit event' : 'Add event'"
    :ui="{ footer: 'justify-end' }"
    :close="{ onClick: () => emit('cancel', event!) }"
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
          <USelectMenu
            v-model="state.project"
            value-key="value"
            :items="projects"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <UButton color="neutral" variant="soft" @click="emit('cancel', event!)"
        >Cancel</UButton
      >
      <UButton type="submit" @click="form?.submit()">Save</UButton>
    </template>
  </UModal>
</template>
