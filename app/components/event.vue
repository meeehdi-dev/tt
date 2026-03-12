<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import type { Event } from "~/types";

enum State {
  Idle,
  Dragging,
  GrabbingTop,
  GrabbingBottom,
}

const { event, slotHeight } = defineProps<{
  event: Event;
  slotHeight: number;
}>();

const eventRef = useTemplateRef("event");

const { y } = useMouse();

const { selectEvent, moveEvent, removeEvent, moveEventStart, moveEventBottom } =
  useEvents();

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

    const slotElement = getSlotElementFromElement(eventRef.value!, "top");

    const slot = slotElement
      ? getSlotFromElement(slotElement)!
      : getSlotFromIndex(0);

    moveEvent(event.id, slot);

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

  const slotElement = getSlotElementFromElement(eventRef.value!, "top");
  if (!slotElement) {
    return;
  }

  const slot = getSlotFromElement(slotElement);
  if (!slot) {
    return;
  }

  moveEventStart(event.id, slot);

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

  const slotElement = getSlotElementFromElement(eventRef.value!, "bottom");
  if (!slotElement) {
    return;
  }

  const slot = getSlotFromElement(slotElement);
  if (!slot) {
    return;
  }

  moveEventBottom(event.id, slot);

  state.value = State.Idle;
}

useEventListener("mouseup", onUngrabTop);
useEventListener("mouseup", onUngrabBottom);
</script>

<template>
  <div
    ref="event"
    class="outline-primary pointer-events-auto relative row-span-(--row-span) row-start-(--row-start) overflow-hidden rounded-sm bg-neutral-800 outline-0 transition-[outline] select-none"
    :class="{
      'shadow-primary-500 z-20 shadow-[0_0_8px] outline-1':
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
      class="hover:to-primary/50 absolute top-0 h-2 w-full cursor-n-resize rounded-t-sm bg-linear-to-t from-transparent to-transparent transition-colors"
      @mousedown="onGrabTop"
    />
    <div
      v-if="!event.project"
      class="absolute flex h-full w-full items-center justify-center"
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
          @click="selectEvent(event.id)"
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
              @click="removeEvent(event.id)"
            />
          </template>
        </UPopover>
      </div>
      <div class="flex flex-col p-1">
        <UBadge class="place-self-start" variant="soft">{{
          event.project
        }}</UBadge>
        <div class="text-muted text-sm whitespace-pre">
          {{ event.description }}
        </div>
      </div>
      <div
        class="hover:to-primary/50 absolute bottom-0 h-2 w-full cursor-s-resize rounded-b-sm bg-linear-to-b from-transparent to-transparent transition-colors"
        @mousedown="onGrabBottom"
      />
    </div>
  </div>
</template>
