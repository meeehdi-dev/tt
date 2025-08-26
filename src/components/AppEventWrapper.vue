<script setup lang="ts">
import { getKey, useEvents } from "@/compasables/useEvents";
import { computed } from "vue";

const {
  events,
  day,
  time: slot,
  slotHeight,
  isGrabbingTop,
  isGrabbingBottom,
} = defineProps<{
  events: ReturnType<typeof useEvents>;
  day: number;
  time: number;
  slotHeight: number;
  isGrabbingTop: string;
  isGrabbingBottom: string;
}>();

const eventKey = computed(() => getKey(day, slot));
const event = computed(() => events.getByKey(eventKey.value));
</script>

<template>
  <div
    v-if="event !== undefined"
    :class="[
      'activity absolute w-full z-10 flex flex-auto flex-col bg-slate-300 text-slate-800 rounded-xs',
      {
        'pointer-events-none':
          isGrabbingTop == eventKey || isGrabbingBottom == eventKey,
      },
    ]"
    :style="{
      height: `calc(${slotHeight * event.duration * 2}px + ${
        0.25 * (event.duration - 0.5)
      }em)`,
    }"
  >
    <slot />
  </div>
</template>
