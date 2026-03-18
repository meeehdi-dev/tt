<script setup lang="ts">
import type { Event } from "~/types";
import { useEventListener } from "@vueuse/core";

enum State {
  Idle,
  Dragging,
  GrabbingTop,
  GrabbingBottom,
}

const { event } = defineProps<{
  event: Event;
}>();

const { startOfDay, endOfDay } = useDate();

const eventRef = useTemplateRef("event");

const { x, y } = useMouse();

const { selectEvent, moveEvent, removeEvent, moveEventStart, moveEventBottom } =
  useEvents();

const { getProjectName } = useProjects();

const state = shallowRef(State.Idle);
const currentX = shallowRef(0);
const currentY = shallowRef(0);
const maxY = shallowRef(0);
const currentHeight = shallowRef(0);

useLongPress({
  target: eventRef,
  onLongPress: () => {
    if ([State.GrabbingTop, State.GrabbingBottom].includes(state.value)) {
      return;
    }

    currentX.value = x.value;
    currentY.value = y.value;

    state.value = State.Dragging;
  },
  onRelease: async () => {
    if (state.value !== State.Dragging) {
      return;
    }

    const slotElement = getSlotElementFromElement(eventRef.value!, "top");

    let date = event.date;
    if (slotElement) {
      date = slotElement.dataset.date!;
    } else {
      const bottomSlot = getSlotElementFromElement(eventRef.value!, "bottom");
      if (bottomSlot) {
        date = bottomSlot.dataset.date!;
      }
    }

    const slot = slotElement ? Number(slotElement.dataset.minute) : 0;

    await moveEvent(event.id, slot, date);

    state.value = State.Idle;
  },
});

function onGrabTop() {
  const rect = eventRef.value!.getBoundingClientRect();

  currentY.value = y.value;
  currentHeight.value = rect.height;

  maxY.value = rect.height - getSlotHeight();

  state.value = State.GrabbingTop;
}
function onUngrabTop() {
  if (state.value !== State.GrabbingTop) {
    return;
  }

  const slotElement = getSlotElementFromElement(eventRef.value!, "top");
  const slot = slotElement
    ? Number(slotElement.dataset.minute)
    : startOfDay.value;

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
  const slot = slotElement
    ? Number(slotElement.dataset.minute)
    : endOfDay.value - SLOT_DURATION;

  moveEventBottom(event.id, slot);

  state.value = State.Idle;
}

useEventListener("mouseup", onUngrabTop);
useEventListener("mouseup", onUngrabBottom);

const translate = computed(() => {
  return state.value === State.GrabbingTop
    ? `0px ${Math.min(maxY.value, y.value - currentY.value)}px`
    : state.value === State.Dragging
      ? `${x.value - currentX.value}px ${y.value - currentY.value}px`
      : undefined;
});

const height = computed(() => {
  const slotHeight = getSlotHeight();

  return state.value === State.GrabbingTop
    ? `${Math.max(slotHeight, currentHeight.value + currentY.value - y.value)}px`
    : state.value === State.GrabbingBottom
      ? `${Math.max(slotHeight, currentHeight.value + y.value - currentY.value)}px`
      : undefined;
});
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
      '--row-start': (event.start - startOfDay) / SLOT_DURATION + 1,
      '--row-span': (event.end - event.start) / SLOT_DURATION,
      translate,
      height,
    }"
    :data-start="event.start"
    :data-end="event.end"
  >
    <div
      class="hover:to-primary/50 absolute top-0 h-2 w-full cursor-n-resize rounded-t-sm bg-linear-to-t from-transparent to-transparent transition-colors"
      @mousedown="onGrabTop"
    />
    <div
      v-if="!event.projectId"
      class="absolute flex h-full w-full items-center justify-center"
    >
      <UIcon name="lucide:loader-circle" class="animate-spin" />
    </div>
    <div v-else>
      <div class="absolute right-0 m-1">
        <UButton
          icon="lucide:edit"
          size="xs"
          variant="ghost"
          color="secondary"
          @click="selectEvent(event.id)"
        />
        <UPopover :content="{ side: 'top' }" arrow>
          <UButton icon="lucide:x" size="xs" variant="ghost" color="error" />

          <template #content>
            <UButton
              label="Confirm"
              icon="lucide:x"
              variant="link"
              color="error"
              @click="removeEvent(event.id)"
            />
          </template>
        </UPopover>
      </div>
      <div class="flex flex-col p-1">
        <UBadge class="place-self-start" variant="soft">{{
          getProjectName(event.projectId)
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
