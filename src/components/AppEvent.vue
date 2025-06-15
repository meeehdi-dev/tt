<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref, useTemplateRef } from "vue";
import AppEventNoteRender from "./AppEventNoteRender.vue";
import AppEventNoteEdit from "./AppEventNoteEdit.vue";

const noteEdit = useTemplateRef("note-edit");

const emits = defineEmits<{
  grabTop: [];
  grabBottom: [];
  remove: [];
  change: [];
  focus: [];
  blur: [];
}>();

const note = defineModel<string>({ default: "" });

const isFocused = ref(false);

function onFocus() {
  isFocused.value = true;
  emits("focus");

  setTimeout(() => {
    noteEdit.value?.focus();
  }, 100);
}

function onBlur() {
  isFocused.value = false;
  emits("blur");
}
</script>

<template>
  <div
    v-if="!isFocused"
    class="flex flex-[0_0_0.25em] cursor-ns-resize"
    @mousedown.left="emits('grabTop')"
  ></div>
  <div
    v-if="!isFocused"
    class="absolute top-0 right-0 w-4 h-4 m-0.5 rounded-full flex justify-center items-center text-rose-400 hover:text-rose-600 cursor-pointer z-10"
    @click.prevent="emits('remove')"
  >
    <Icon icon="carbon:circle-solid" />
  </div>
  <AppEventNoteRender v-if="!isFocused" :note="note" @click="onFocus" />
  <AppEventNoteEdit
    ref="note-edit"
    v-if="isFocused"
    v-model="note"
    @change="emits('change')"
    @blur="onBlur"
  />
  <div
    v-if="!isFocused"
    class="flex flex-[0_0_0.25em] cursor-ns-resize"
    @mousedown.left="emits('grabBottom')"
  ></div>
</template>
