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

const currentWeek = ref(dayjs());

const now = ref(dayjs());
let nowTimeout = 0;
onMounted(() => {
  nowTimeout = setInterval(() => {
    now.value = dayjs();
  }, 1000);
});
onUnmounted(() => {
  clearTimeout(nowTimeout);
});

const currentTime = computed(() => now.value.hour() * 60 + now.value.minute());

const currentDayNowIndicatorTranslate = computed(() =>
  Math.round(((currentTime.value - 8 * 60) / (12 * 60)) * weekHeight.value),
);

const startOfWeekOffset = shallowRef(StartOfWeekDay.Monday);

const days = ref<number[]>(
  Array(7)
    .fill(undefined)
    .map((_, i) => (i + startOfWeekOffset.value + 7) % 7),
);

const currentDay = now.value.day();

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

function getTimeLabel(time: number) {
  const hours = time.toFixed(1);
  if (hours.endsWith(".0")) {
    return hours.slice(0, -2);
  }
  return hours;
}

function getDayHours(day: number) {
  return getTimeLabel(
    events.value
      .filter((e) => e.day === day)
      .reduce((sum, e) => sum + e.end.index - e.start.index + 1, 0) / 2,
  );
}

function getDayProgress(day: number) {
  const progress =
    events.value
      .filter((e) => e.day === day)
      .reduce((sum, e) => sum + e.end.index - e.start.index + 1, 0) / 16;
  if (progress > 1) {
    return 1 - (progress - 1) * 2;
  }
  return progress;
}

function getDayOvertime(day: number) {
  return (
    (events.value
      .filter((e) => e.day === day)
      .reduce((sum, e) => sum + e.end.index - e.start.index + 1, 0) -
      16) /
    8
  );
}

const timeLabel = computed(() => `${now.value.format("HH:mm:ss")}`);

function getDayEvents(day: number) {
  return events.value
    .sort((a, b) => a.start.index - b.start.index)
    .filter((e) => e.day === day);
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
  const computedStyle = getComputedStyle(slotsRef.value![0]!);
  slotHeight.value =
    slotsRef.value![0]!.getBoundingClientRect().height -
    Number(computedStyle.borderTopWidth.slice(0, -2)) * 2;
});

const d = computed(() => dayjs(currentWeek.value));

const startOfWeek = computed(() =>
  d.value.startOf("week").add(startOfWeekOffset.value, "day"),
);
const endOfWeek = computed(() =>
  d.value.endOf("week").add(startOfWeekOffset.value, "day"),
);
</script>

<template>
  <ClientOnly>
    <div class="w-screen h-screen flex flex-col gap-1">
      <div class="flex items-center justify-between mt-1">
        <div>
          <UButton
            :variant="
              currentWeek.isoWeek() === now.isoWeek() ? 'soft' : 'outline'
            "
            label="This week"
            class="ml-13 py-1 cursor-pointer"
            size="sm"
            :color="
              currentWeek.isoWeek() === now.isoWeek() ? 'primary' : 'neutral'
            "
            @click="currentWeek = dayjs()"
          />
        </div>
        <div class="flex items-center gap-2">
          <UButton
            icon="lucide:chevron-left"
            variant="soft"
            class="py-0 cursor-pointer"
            @click="currentWeek = currentWeek.subtract(1, 'week')"
          />
          <span class="text-sm text-muted">
            Week {{ d.isoWeek() }} |
            {{
              startOfWeek.toDate().toLocaleDateString(undefined, {
                month: "2-digit",
                day: "2-digit",
              })
            }}
            -
            {{
              endOfWeek.toDate().toLocaleDateString(undefined, {
                month: "2-digit",
                day: "2-digit",
              })
            }}
          </span>
          <UButton
            icon="lucide:chevron-right"
            variant="soft"
            class="py-0 cursor-pointer"
            @click="currentWeek = currentWeek.add(1, 'week')"
          />
        </div>
        <div>
          <!-- TODO: -->
        </div>
      </div>
      <div class="flex gap-2 px-1 w-full h-full">
        <div class="h-full grid grid-rows-12">
          <div
            v-for="hour in hours.slice(0, 12)"
            :key="hour.index"
            class="-translate-y-3"
          >
            {{ hour.hour.toString().padStart(2, "0") }}:00
          </div>
        </div>
        <div ref="week" class="grid grid-cols-7 gap-1 w-full h-full">
          <div
            v-for="day in days"
            :key="day"
            class="relative rounded-sm h-full grid"
          >
            <USeparator
              v-if="
                day === currentDay &&
                currentTime > 8 * 60 &&
                currentTime < 20 * 60
              "
              color="primary"
              decorative
              class="absolute translate-y-(--translate-y) pointer-events-none z-10"
              :style="{
                '--translate-y': `calc(${currentDayNowIndicatorTranslate}px - 50%)`,
              }"
              :ui="{
                container: 'm-0',
              }"
            >
              <UBadge
                :label="timeLabel"
                color="primary"
                size="sm"
                variant="subtle"
              />
            </USeparator>
            <div
              v-for="time in availableSlots"
              :key="`${day}-${time.index}`"
              ref="slots"
              :data-slot="time.index"
              :data-day="day"
              class="rounded-sm hover:bg-neutral-700 transition-colors cursor-pointer border-y-2 border-neutral-900"
              :class="{
                'bg-neutral-700!':
                  currentEvent &&
                  day === currentEvent.day &&
                  time.index >= currentEvent.start.index &&
                  time.index <= currentEvent.end.index,
                'bg-neutral-800/50': day > 0 && day < 6, // Monday to Friday
                'bg-neutral-800/30': day === 0 || day === 6,
              }"
              @mouseover="onSlotHover"
            ></div>
            <div
              class="absolute w-full h-full pointer-events-none grid grid-rows-24 gap-1"
            >
              <Event
                v-for="event in events.filter((e) => e.day === day)"
                :key="`${day}-${event.id}`"
                :event="event"
                :slot-height="slotHeight"
                @edit="
                  (edited) => {
                    selectedEvent = edited;
                  }
                "
                @remove="
                  (removed) => {
                    events = events.filter((e) => e !== removed);
                  }
                "
                @move="
                  (target) => {
                    onEventMove(target, event);
                  }
                "
                @move-top="
                  (target) => {
                    onEventMoveTop(target, event);
                  }
                "
                @move-bottom="
                  (target) => {
                    onEventMoveBottom(target, event);
                  }
                "
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-2 px-1 pb-1 w-full">
        <div class="-translate-y-4">20:00</div>
        <div class="grid grid-cols-7 gap-1 w-full">
          <div
            v-for="day in days"
            :key="`${day}-progress`"
            class="rounded-sm h-full bg-neutral-800 overflow-hidden flex relative"
          >
            <div
              class="absolute left-1/2 top-1/2 flex justify-center items-center"
            >
              <UPopover arrow>
                <UBadge
                  class="absolute cursor-pointer text-sm"
                  variant="soft"
                  icon="lucide:clock"
                  ><span class="whitespace-nowrap"
                    >{{ getDayHours(day) }} hrs</span
                  ></UBadge
                >
                <template #content
                  ><div
                    class="p-1 pr-2 bg-neutral-900 rounded-xl flex flex-col gap-1"
                  >
                    <div
                      v-for="event in getDayEvents(day)"
                      :key="`${day}-progress-${event.id}`"
                      class="flex gap-2 items-center"
                    >
                      <UBadge variant="soft">
                        {{ event.project }}
                      </UBadge>
                      <span class="text-sm">
                        {{
                          getTimeLabel(
                            (event.end.index - event.start.index + 1) / 2,
                          )
                        }}
                        hrs
                      </span>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
            <div
              class="h-full w-(--day-progress) bg-neutral-700"
              :style="{
                '--day-progress': getDayProgress(day) * 100 + '%',
              }"
            ></div>
            <div
              class="h-full w-(--overtime-progress) bg-primary-500/30"
              :style="{
                '--overtime-progress': getDayOvertime(day) * 100 + '%',
              }"
            ></div>
          </div>
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
