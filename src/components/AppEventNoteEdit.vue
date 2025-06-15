<script setup lang="ts">
import { useTemplateRef } from "vue";

const textarea = useTemplateRef("note");

const model = defineModel<string>({ default: "" });

const emits = defineEmits<{
  change: [];
  blur: [];
}>();

defineExpose({
  focus,
});

function focus() {
  textarea.value?.focus();
}
</script>

<template>
  <textarea
    ref="note"
    class="flex bg-transparent flex-auto h-full p-1 m-0 border-none outline-none resize-none text-xs"
    v-model="model"
    @change="emits('change')"
    @blur="emits('blur')"
  ></textarea>
</template>
