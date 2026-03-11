<script setup lang="ts">
import dayjs from "dayjs";
import { StartOfWeekDay, type Event } from "~/types";

useSeoMeta({
  title: "Calendar",
});

const weekRef = useTemplateRef("week");
const slotsRef = useTemplateRef("slots");

const weekHeight = computed(
  () =>
    // NOTE: can use vue-use to make it reactive to window height change
    weekRef.value?.scrollHeight ?? 0,
);

const currentWeekDate = ref(dayjs());

const now = ref(dayjs());

const startOfWeekOffset = shallowRef(StartOfWeekDay.Monday);

const days = ref<number[]>(
  Array(7)
    .fill(undefined)
    .map((_, i) => (i + startOfWeekOffset.value + 7) % 7),
);

const { events, currentEvent, selectedEvent, onSlotHover } = useEvents({
  target: weekRef,
});

function onEventMove(target: HTMLElement, event: Event) {
  const rect = target.getBoundingClientRect();
  const x = rect.x + rect.width / 2;
  const y = rect.y;
  target.style.visibility = "hidden";
  let slotElement = document.elementFromPoint(x, y) as HTMLElement;
  target.style.visibility = "";
  if (!slotElement) {
    return;
  }
  const slotElementRect = slotElement.getBoundingClientRect();
  if (
    y > slotElementRect.y + slotElementRect.height / 2 &&
    slotElement.nextElementSibling
  ) {
    slotElement = slotElement.nextElementSibling as HTMLElement;
  }

  const eventLength = event.end.index - event.start.index;

  const startSlotIndex = Number(slotElement.dataset["slot"]);
  if (isNaN(startSlotIndex)) {
    event.start = getSlotFromIndex(0);
    event.end = getSlotFromIndex(eventLength);
    return;
  }

  const slot = availableSlots.find((s) => s.index === startSlotIndex);
  if (!slot) {
    return;
  }

  const diff = event.start.index - slot.index;
  const endIndex = event.end.index - diff;

  if (endIndex > 23) {
    event.start = getSlotFromIndex(23 - eventLength);
    event.end = getSlotFromIndex(23);
    return;
  }

  event.start = getSlotFromIndex(slot.index);
  event.end = getSlotFromIndex(endIndex);
}

function onEventMoveTop(target: HTMLElement, event: Event) {
  const rect = target.getBoundingClientRect();
  const x = rect.x + rect.width / 2;
  const y = rect.y;
  target.style.visibility = "hidden";
  let slotElement = document.elementFromPoint(x, y) as HTMLElement;
  target.style.visibility = "";
  if (!slotElement) {
    return;
  }
  const slotElementRect = slotElement.getBoundingClientRect();
  if (
    y > slotElementRect.y + slotElementRect.height / 2 &&
    slotElement.nextElementSibling
  ) {
    slotElement = slotElement.nextElementSibling as HTMLElement;
  }

  const slot = getSlotFromElement(slotElement);
  if (!slot) {
    return;
  }

  event.start = getSlotFromIndex(slot.index);
}

function onEventMoveBottom(target: HTMLElement, event: Event) {
  const rect = target.getBoundingClientRect();
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height;
  target.style.visibility = "hidden";
  let slotElement = document.elementFromPoint(x, y) as HTMLElement;
  target.style.visibility = "";
  if (!slotElement) {
    return;
  }
  const slotElementRect = slotElement.getBoundingClientRect();
  if (
    y < slotElementRect.y + slotElementRect.height / 2 &&
    slotElement.previousElementSibling
  ) {
    slotElement = slotElement.previousElementSibling as HTMLElement;
  }

  const endSlotIndex = Number(slotElement.dataset["slot"]);
  if (isNaN(endSlotIndex)) {
    return;
  }

  const slot = availableSlots.find((s) => s.index === endSlotIndex);
  if (!slot) {
    return;
  }

  event.end = getSlotFromIndex(slot.index);
}

function onSaveEvent(ev: Event) {
  const event = events.value.find((e) => e.id === ev.id);
  if (!event) {
    return;
  }

  event.project = ev.project;
  event.description = ev.description;

  selectedEvent.value = undefined;
}

function onCloseEventModal(event: Event) {
  selectedEvent.value = undefined;
  if (event.project !== "") {
    return;
  }

  events.value = events.value.filter((e) => e.id !== event.id);
}

const slotHeight = shallowRef(0);
watch(slotsRef, () => {
  const el = slotsRef.value![0]!.$el as HTMLElement;
  const computedStyle = getComputedStyle(el);
  slotHeight.value =
    el.getBoundingClientRect().height -
    Number(computedStyle.borderTopWidth.slice(0, -2)) * 2;
});

function onRemoveEvent(event: Event) {
  events.value = events.value.filter((e) => e !== event);
}
</script>

<template>
  <ClientOnly>
    <div class="w-screen h-screen flex flex-col gap-1">
      <div class="flex items-center justify-between mt-1">
        <UButton
          :variant="
            currentWeekDate.isoWeek() === now.isoWeek() ? 'soft' : 'outline'
          "
          label="This week"
          class="ml-13 py-1 cursor-pointer"
          size="sm"
          :color="
            currentWeekDate.isoWeek() === now.isoWeek() ? 'primary' : 'neutral'
          "
          @click="currentWeekDate = dayjs()"
        />
        <WeekIndicator
          :date="currentWeekDate"
          @previous="currentWeekDate = currentWeekDate.subtract(1, 'week')"
          @next="currentWeekDate = currentWeekDate.add(1, 'week')"
        />
        <div>
          <!-- TODO: settings, signin/out -->
        </div>
      </div>
      <div class="flex gap-2 px-1 w-full h-full">
        <div class="h-full grid grid-rows-12">
          <TimeIndicator />
        </div>
        <div ref="week" class="grid grid-cols-7 gap-1 w-full h-full">
          <div
            v-for="day in days"
            :key="day"
            class="relative rounded-sm h-full grid"
          >
            <CurrentTimeIndicator :day="day" :day-height="weekHeight" />
            <DaySlot
              v-for="time in availableSlots"
              :key="`${day}-${time.index}`"
              ref="slots"
              :day="day"
              :time="time"
              :current-event="currentEvent"
              @slot-hover="onSlotHover"
            />
            <div
              class="absolute w-full h-full pointer-events-none grid grid-rows-24 gap-1"
            >
              <Event
                v-for="event in events.filter((e) => e.day === day)"
                :key="`${day}-${event.id}`"
                :event="event"
                :slot-height="slotHeight"
                @edit="selectedEvent = $event"
                @remove="onRemoveEvent"
                @move="onEventMove($event, event)"
                @move-top="onEventMoveTop($event, event)"
                @move-bottom="onEventMoveBottom($event, event)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-2 px-1 pb-1 w-full">
        <div class="-translate-y-4">20:00</div>
        <div class="grid grid-cols-7 gap-1 w-full">
          <DayProgress
            v-for="day in days"
            :key="`${day}-progress`"
            :day="day"
            :events="events"
          />
        </div>
      </div>
    </div>
    <EventModal
      :event="selectedEvent"
      @save="onSaveEvent"
      @cancel="onCloseEventModal"
    />
  </ClientOnly>
</template>
