<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import type { Event } from "~/types";

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

const { selectEvent, moveEvent, removeEvent, moveEventStart, moveEventBottom } = useEvents();

const { getProjectName, isProjectDeleted, getProjectColor } = useProjects();

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
  const slot = slotElement ? Number(slotElement.dataset.minute) : startOfDay.value;

  void moveEventStart(event.id, slot);

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
  const slot = slotElement ? Number(slotElement.dataset.minute) : endOfDay.value - SLOT_DURATION;

  void moveEventBottom(event.id, slot);

  state.value = State.Idle;
}

useEventListener("mouseup", onUngrabTop);
useEventListener("mouseup", onUngrabBottom);

const translate = computed(() => {
  return (
    state.value === State.GrabbingTop ? `0px ${Math.min(maxY.value, y.value - currentY.value)}px`
    : state.value === State.Dragging ? `${x.value - currentX.value}px ${y.value - currentY.value}px`
    : undefined
  );
});

const height = computed(() => {
  const slotHeight = getSlotHeight();

  return (
    state.value === State.GrabbingTop ? `${Math.max(slotHeight, currentHeight.value + currentY.value - y.value)}px`
    : state.value === State.GrabbingBottom ? `${Math.max(slotHeight, currentHeight.value + y.value - currentY.value)}px`
    : undefined
  );
});

const rowStart = computed(() => (event.start - startOfDay.value) / SLOT_DURATION + 1);
const rowSpan = computed(() => (event.end - event.start) / SLOT_DURATION);

const eventContrastColor = computed(() => getContrastColor(getProjectColor(event.projectId)));
</script>

<template>
  <div
    ref="event"
    class="outline-primary group pointer-events-auto relative row-span-(--row-span) row-start-(--row-start) overflow-hidden rounded-sm bg-neutral-800 outline-0 transition-[outline] select-none"
    :class="{
      'shadow-primary-500 z-20 shadow-[0_0_8px] outline-1': state === State.Dragging,
    }"
    :style="{
      '--row-start': rowStart,
      '--row-span': rowSpan,
      translate,
      height,
    }"
    :data-start="event.start"
    :data-end="event.end"
    @dblclick="selectEvent(event.id)"
  >
    <div
      class="hover:to-primary/50 absolute top-0 h-2 w-full cursor-n-resize rounded-t-sm bg-linear-to-t from-transparent to-transparent transition-colors"
      @mousedown="onGrabTop"
    />
    <div v-if="!event.projectId" class="absolute flex h-full w-full items-center justify-center">
      <UIcon name="lucide:loader-circle" class="animate-spin" />
    </div>
    <div v-else>
      <UPopover
        :content="{ side: 'right' }"
        class="absolute right-0 m-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <UButton icon="lucide:x" size="xs" variant="ghost" color="error" />

        <template #content>
          <UButton
            label="Remove event?"
            icon="lucide:trash"
            variant="soft"
            color="error"
            @click="removeEvent(event.id)"
          />
        </template>
      </UPopover>
      <div class="flex flex-col p-1">
        <UBadge
          class="place-self-start"
          variant="soft"
          :class="{ 'opacity-50': isProjectDeleted(event.projectId) }"
          :style="{
            backgroundColor: getProjectColor(event.projectId),
            color: eventContrastColor,
          }"
        >
          {{ getProjectName(event.projectId) }}
        </UBadge>
        <UEditor
          :model-value="event.description || ''"
          :editable="false"
          content-type="markdown"
          :ui="{
            base: 'sm:px-0 *:my-1 [&_p]:text-sm [&_p]:text-muted [&_pre]:px-2 [&_pre]:py-1 [&_pre]:bg-neutral-900/50 [&_code]:bg-neutral-900/50',
          }"
        />
      </div>
      <div
        class="hover:to-primary/50 absolute bottom-0 h-2 w-full cursor-s-resize rounded-b-sm bg-linear-to-b from-transparent to-transparent transition-colors"
        @mousedown="onGrabBottom"
      />
    </div>
  </div>
</template>
