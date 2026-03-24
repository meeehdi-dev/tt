<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });
defineProps<{
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}>();
const emit = defineEmits<{
  (e: "confirm" | "cancel"): void;
}>();
</script>

<template>
  <UModal v-model:open="open" :title="title" :ui="{ footer: 'justify-end' }">
    <template #body>
      <p class="text-sm">{{ message }}</p>
    </template>
    <template #footer>
      <UButton
        color="neutral"
        variant="soft"
        @click="
          emit('cancel');
          open = false;
        "
        >{{ cancelText || "Cancel" }}</UButton
      >
      <UButton
        :color="(confirmColor as any) || 'primary'"
        @click="
          emit('confirm');
          open = false;
        "
        >{{ confirmText || "Confirm" }}</UButton
      >
    </template>
  </UModal>
</template>
