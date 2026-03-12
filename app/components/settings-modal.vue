<script setup lang="ts">
import { StartOfWeekDay } from "~/types";

const isOpen = defineModel<boolean>();

const { startOfWeekDay } = useDate();

const localStartOfWeekDay = ref<StartOfWeekDay>(startOfWeekDay.value);

const startOfWeekOptions = [
  { label: "Saturday", value: StartOfWeekDay.Saturday },
  { label: "Sunday", value: StartOfWeekDay.Sunday },
  { label: "Monday", value: StartOfWeekDay.Monday },
];

function onCancel() {
  localStartOfWeekDay.value = startOfWeekDay.value;
  isOpen.value = false;
}

function onSave() {
  startOfWeekDay.value = localStartOfWeekDay.value;
  isOpen.value = false;
}

watch(isOpen, (open) => {
  if (open) {
    localStartOfWeekDay.value = startOfWeekDay.value;
  }
});
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
