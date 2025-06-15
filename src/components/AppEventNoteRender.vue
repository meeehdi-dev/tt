<script setup lang="ts">
const { note } = defineProps<{
  note: string;
}>();

const emits = defineEmits<{
  click: [];
}>();

function parse(note: string) {
  return note
    .split("\n")
    .map((line) => '<p class="inline-flex">' + line + "</p>")
    .join("<br>")
    .replace(
      /#(\w+)/g,
      '<span class="bg-sky-300 text-sky-800 font-bold rounded-sm px-1">#$1</span>',
    );
}
</script>

<template>
  <div
    @click="emits('click')"
    class="flex flex-col bg-transparent flex-auto h-full px-1 m-0 text-xs whitespace-pre justify-center"
    v-html="parse(note)"
  ></div>
</template>
