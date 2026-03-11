<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import type { Event } from "~/types";

enum State {
  Idle,
  Dragging,
  GrabbingTop,
  GrabbingBottom,
}

const { slotHeight } = defineProps<{
  event: Event;
  slotHeight: number;
}>();

const emit = defineEmits<{
  edit: [Event];
  remove: [Event];
  move: [HTMLElement];
  moveTop: [HTMLElement];
  moveBottom: [HTMLElement];
}>();

const eventRef = useTemplateRef("event");

const { y } = useMouse();

const state = shallowRef(State.Idle);
const currentY = shallowRef(0);
const maxY = shallowRef(0);
const currentHeight = shallowRef(0);

useLongPress({
  target: eventRef,
  onLongPress: () => {
    if ([State.GrabbingTop, State.GrabbingBottom].includes(state.value)) {
      return;
    }

    currentY.value = y.value;
    state.value = State.Dragging;
  },
  onRelease: () => {
    if (state.value !== State.Dragging) {
      return;
    }

    emit("move", eventRef.value!);
    state.value = State.Idle;
  },
});

function onGrabTop() {
  const rect = eventRef.value!.getBoundingClientRect();

  currentY.value = y.value;
  currentHeight.value = rect.height;

  maxY.value = rect.height - slotHeight;

  state.value = State.GrabbingTop;
}
function onUngrabTop() {
  if (state.value !== State.GrabbingTop) {
    return;
  }

  emit("moveTop", eventRef.value!);
  state.value = State.Idle;
}
function onGrabBottom() {
  const rect = eventRef.value!.getBoundingClientRect();

  currentY.value = y.value;
  currentHeight.value = rect.height;

  state.value = State.GrabbingBottom;
}
function onUngrabBottom() {
  if (state.value !== State.GrabbingBottom) {
    return;
  }

  emit("moveBottom", eventRef.value!);
  state.value = State.Idle;
}

useEventListener("mouseup", onUngrabTop);
useEventListener("mouseup", onUngrabBottom);
</script>

<template>
  <div
    ref="event"
    class="bg-neutral-800 rounded-sm row-start-(--row-start) row-span-(--row-span) pointer-events-auto relative transition-[outline] outline-0 outline-primary overflow-hidden select-none"
    :class="{
      'outline-1 shadow-[0_0_8px] shadow-primary-500 z-20':
        state === State.Dragging,
    }"
    :style="{
      '--row-start': event.start.index + 1,
      '--row-span': event.end.index + 1 - event.start.index,
      translate:
        state === State.GrabbingTop
          ? `0 ${Math.min(maxY, y - currentY)}px`
          : state === State.Dragging
            ? `0 ${y - currentY}px`
            : undefined,
      height:
        state === State.GrabbingTop
          ? `${Math.max(slotHeight, currentHeight + currentY - y)}px`
          : state === State.GrabbingBottom
            ? `${Math.max(slotHeight, currentHeight + y - currentY)}px`
            : undefined,
    }"
  >
    <div
      class="h-2 w-full rounded-t-sm cursor-n-resize bg-linear-to-t from-transparent to-transparent hover:to-primary/50 transition-colors absolute top-0"
      @mousedown="onGrabTop"
    />
    <div
      v-if="!event.project"
      class="absolute h-full w-full flex justify-center items-center"
    >
      <UIcon name="lucide:loader-circle" class="animate-spin" />
    </div>
    <div v-else>
      <div class="absolute right-0 m-1">
        <UButton
          icon="lucide:edit"
          size="xs"
          class="cursor-pointer"
          variant="ghost"
          color="secondary"
          @click="emit('edit', event)"
        />
        <UPopover :content="{ side: 'top' }" arrow>
          <UButton
            icon="lucide:x"
            size="xs"
            class="cursor-pointer"
            variant="ghost"
            color="error"
          />

          <template #content>
            <UButton
              label="Confirm"
              icon="lucide:x"
              class="cursor-pointer"
              variant="link"
              color="error"
              @click="emit('remove', event)"
            />
          </template>
        </UPopover>
      </div>
      <div class="flex flex-col p-1">
        <UBadge class="place-self-start" variant="soft">{{
          event.project
        }}</UBadge>
        <div class="whitespace-pre text-sm text-muted">
          {{ event.description }}
        </div>
      </div>
      <div
        class="h-2 w-full rounded-b-sm cursor-s-resize bg-linear-to-b from-transparent to-transparent hover:to-primary/50 transition-colors absolute bottom-0"
        @mousedown="onGrabBottom"
      />
    </div>
  </div>
</template>
