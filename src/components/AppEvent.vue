<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, useTemplateRef } from 'vue'

const noteEl = useTemplateRef<HTMLTextAreaElement>('note-el')

const emits = defineEmits<{
  onGrabTop: [number, number]
  onGrabBottom: [number, number]
  onRemove: [number, number]
  onChange: [number, number]
  onFocus: [number, number]
  onBlur: [number, number]
}>()

const { day, timeslot: slot } = defineProps<{
  day: number
  timeslot: number
}>()

const note = defineModel<string>()

const isFocused = ref(false)

function onFocus(day: number, slot: number) {
  isFocused.value = true
  emits('onFocus', day, slot)

  setTimeout(() => {
    noteEl.value?.focus()
  }, 100)
}

function onBlur(day: number, slot: number) {
  isFocused.value = false
  emits('onBlur', day, slot)
}

function parse(note: string) {
  return note
    .split('\n')
    .map((line) => '<p class="inline-flex">' + line + '</p>')
    .join('<br>')
    .replace(
      /#(\w+)/g,
      '<span class="bg-sky-300 text-sky-800 font-bold rounded-sm px-1">#$1</span>',
    )
}
</script>

<template>
  <div
    v-if="!isFocused"
    class="flex flex-[0_0_0.25em] cursor-row-resize"
    @mousedown.left="emits('onGrabTop', day, slot)"
  ></div>
  <div
    v-if="!isFocused"
    class="absolute top-0 right-0 w-4 h-4 m-0.5 rounded-full flex justify-center items-center text-rose-400 hover:text-rose-600 cursor-pointer z-10"
    @click.prevent="emits('onRemove', day, slot)"
  >
    <Icon icon="carbon:circle-solid" />
  </div>
  <div
    v-if="!isFocused"
    @click="onFocus(day, slot)"
    class="flex flex-col bg-transparent flex-auto h-full px-1 m-0 text-xs whitespace-pre justify-center"
    v-html="parse(note ?? '')"
  ></div>
  <textarea
    v-if="isFocused"
    ref="note-el"
    class="flex bg-transparent flex-auto h-full p-1 m-0 border-none outline-none resize-none text-xs"
    v-model="note"
    @change="emits('onChange', day, slot)"
    @blur="onBlur(day, slot)"
  ></textarea>
  <div
    v-if="!isFocused"
    class="flex flex-[0_0_0.25em] cursor-row-resize"
    @mousedown.left="emits('onGrabBottom', day, slot)"
  ></div>
</template>
