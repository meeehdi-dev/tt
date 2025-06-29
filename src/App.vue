<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import AppEventWrapper from "./components/AppEventWrapper.vue";
import AppEvent from "./components/AppEvent.vue";
import AppEventsSummary from "./components/AppEventsSummary.vue";
import {
  DAY_END,
  DAY_START,
  days,
  slots,
  State,
  times,
  WEEK_END,
  WEEK_START,
  type SlotRange,
} from "@/util";
import { getKey, useEvents } from "@/compasables/useEvents";

const now = new Date();
const currentDayIndex = now.getDay();
const state = ref(State.Idle);
const startOfWeek = ref(new Date());
startOfWeek.value.setDate(startOfWeek.value.getDate() - currentDayIndex + 1);
const endOfWeek = ref(new Date());
endOfWeek.value.setDate(endOfWeek.value.getDate() + 5 - currentDayIndex);
const isMouseDown = ref(false);
const selectedSlots = ref<SlotRange>();
const events = useEvents();
const slotHeight = ref(0);
const isFocused = ref("");
const isGrabbingTop = ref("");
const isGrabbingBottom = ref("");

function setSlotHeight(): boolean {
  const slotElement = document.getElementsByClassName(
    "slot",
  )[0] as HTMLDivElement;
  if (!slotElement) {
    return false;
  }
  slotHeight.value = slotElement.offsetHeight;
  return true;
}

onMounted(async () => {
  while (!setSlotHeight()) {
    await new Promise((r) => setTimeout(r, 10));
  }
  window.addEventListener("resize", setSlotHeight);
});
onUnmounted(() => {
  window.removeEventListener("resize", setSlotHeight);
});

events.load(startOfWeek.value);

function onMouseDown(e: MouseEvent, day: number, slot: number) {
  if (e.target !== e.currentTarget) {
    // NOTE: ignore if clinking on an event
    return;
  }

  if (![State.Idle].includes(state.value)) {
    return;
  }
  state.value = State.Selecting;

  if (isFocused.value !== "") {
    return;
  }

  isMouseDown.value = true;
  selectedSlots.value = {
    day,
    start: slot,
    end: slot,
    note: "",
    duration: 0.5,
  };
}

function onMouseUp() {
  if (![State.Selecting, State.Grabbing].includes(state.value)) {
    return;
  }
  state.value = State.Idle;
  if (!isMouseDown.value || !selectedSlots.value || isFocused.value) {
    if (isGrabbingTop.value || isGrabbingBottom.value) {
      isGrabbingTop.value = "";
      isGrabbingBottom.value = "";
      selectedSlots.value = undefined;
      events.save(startOfWeek.value);
    }
    return;
  }

  isMouseDown.value = false;

  const end = selectedSlots.value.end ?? selectedSlots.value.start;
  events.data.value.push({
    day: selectedSlots.value.day,
    start: selectedSlots.value.start,
    end,
    note: "",
    duration: end - selectedSlots.value.start + 0.5,
  });
  events.save(startOfWeek.value);

  selectedSlots.value = undefined;
}

function onMouseOver(slot: number) {
  if (![State.Selecting, State.Grabbing].includes(state.value)) {
    return;
  }

  if (state.value === State.Grabbing) {
    if (isGrabbingTop.value) {
      const activity = events.getByKey(isGrabbingTop.value);
      if (!activity || slot > activity.end) {
        return;
      }
      activity.start = slot;
      activity.duration = activity.end - activity.start + 0.5;
      isGrabbingTop.value = getKey(activity.day, activity.start);
      return;
    }
    if (isGrabbingBottom.value) {
      const activity = events.getByKey(isGrabbingBottom.value);
      if (!activity || slot < activity.start) {
        return;
      }
      activity.end = slot;
      activity.duration = activity.end - activity.start + 0.5;
      return;
    }
  }

  if (!isMouseDown.value || !selectedSlots.value) {
    return;
  }

  selectedSlots.value.end = slot;
}

function isSelected(day: number, slot: number): boolean {
  if (!selectedSlots.value) {
    return false;
  }

  const start = selectedSlots.value.start;
  const end = selectedSlots.value.end;
  const current = slot;

  return day == selectedSlots.value.day && current >= start && current <= end;
}

function onFocus(day: number, slot: number) {
  state.value = State.Focused;

  if (isGrabbingTop.value || isGrabbingBottom.value) {
    return;
  }
  isFocused.value = getKey(day, slot);
}

function onBlur() {
  // NOTE: this is a hack to prevent the state from changing to Selecting
  // when the user clicks outside the textarea
  setTimeout(() => {
    state.value = State.Idle;
  }, 100);

  isFocused.value = "";
}

function onRemove(day: number, slot: number) {
  const key = getKey(day, slot);
  const activity = events.getByKey(key);
  if (!activity || activity.note == "" || window.confirm("Confirm?")) {
    events.data.value = events.data.value.filter(
      ({ day: d, start }) => getKey(d, start) !== key,
    );
    events.save(startOfWeek.value);
  }
}

function onChange(day: number, slot: number) {
  const activity = events.getBySlot(day, slot);
  if (!activity) {
    return;
  }

  activity.note = activity.note.trim();
  events.save(startOfWeek.value);
}

function changeDate(days: number) {
  startOfWeek.value.setDate(startOfWeek.value.getDate() + days);
  endOfWeek.value.setDate(endOfWeek.value.getDate() + days);
  events.load(startOfWeek.value);
}

function onPreviousWeek() {
  changeDate(-7);
}
function onNextWeek() {
  changeDate(7);
}

function onGrabTop(day: number, slot: number) {
  if (![State.Idle].includes(state.value)) {
    return;
  }
  state.value = State.Grabbing;

  isGrabbingTop.value = getKey(day, slot);
}
function onGrabBottom(day: number, slot: number) {
  if (![State.Idle].includes(state.value)) {
    return;
  }
  state.value = State.Grabbing;

  isGrabbingBottom.value = getKey(day, slot);
}
</script>

<template>
  <div class="flex flex-col flex-auto">
    <div class="flex flex-row ml-10 justify-between">
      <div class="flex flex-row gap-1 items-center">
        <Icon
          icon="circum:timer"
          style="font-size: 1.5em"
          class="rotate-y-180 text-slate-700"
        />
        <span class="text-sm text-slate-600">tt</span>
      </div>
      <div class="flex flex-row items-center gap-1">
        <div
          class="text-slate-800 hover:text-slate-600 cursor-pointer p-1"
          @click="onPreviousWeek"
        >
          <Icon icon="carbon:triangle-left-solid" />
        </div>
        <span class="text-slate-600 text-xs">
          {{
            startOfWeek.toLocaleDateString(undefined, {
              month: "2-digit",
              day: "2-digit",
            })
          }}
          -
          {{
            endOfWeek.toLocaleDateString(undefined, {
              month: "2-digit",
              day: "2-digit",
            })
          }}
        </span>
        <div
          class="text-slate-800 hover:text-slate-600 cursor-pointer p-1"
          @click="onNextWeek"
        >
          <Icon icon="carbon:triangle-right-solid" />
        </div>
      </div>
      <div class="flex">
        <a
          href="https://github.com/meeehdi-dev/tt"
          target="_blank"
          class="text-slate-700 hover:text-slate-600 p-1"
        >
          <Icon icon="carbon:logo-github" style="font-size: 1.5em" />
        </a>
      </div>
    </div>
    <div class="flex flex-row flex-auto">
      <div
        class="flex flex-col min-w-10 justify-between items-center text-xs text-slate-600 -mt-3 -mb-3 p-1"
      >
        <div
          v-bind:key="time"
          v-for="time in times
            .filter((t) => t === Math.floor(t))
            .map((t) => t.toString().padStart(2, '0'))"
        >
          {{ time }}:00
        </div>
      </div>
      <!-- 5 days -->
      <div :class="`grid grid-cols-${WEEK_END - WEEK_START + 1} gap-1 w-full`">
        <!-- day, 24 slots -->
        <div
          :class="`grid grid-rows-${(DAY_END - DAY_START) * 2} h-full gap-0.5`"
          v-bind:key="day"
          v-for="day in days"
        >
          <div
            v-bind:key="slot"
            v-for="slot in slots"
            :class="[
              'slot flex flex-auto bg-slate-900 rounded-xs cursor-pointer relative',
              {
                '!bg-slate-800 cursor-pointer': isSelected(day, slot),
              },
            ]"
            @mousedown.left="(e) => onMouseDown(e, day, slot)"
            @mouseup.left="onMouseUp"
            @mouseover="onMouseOver(slot)"
          >
            <AppEventWrapper
              :events="events"
              :day="day"
              :time="slot"
              :slot-height="slotHeight"
              :is-grabbing-top="isGrabbingTop"
              :is-grabbing-bottom="isGrabbingBottom"
            >
              <AppEvent
                v-model="events.getBySlot(day, slot)!.note"
                @grab-top="onGrabTop(day, slot)"
                @grab-bottom="onGrabBottom(day, slot)"
                @remove="onRemove(day, slot)"
                @change="onChange(day, slot)"
                @focus="onFocus(day, slot)"
                @blur="onBlur"
              />
            </AppEventWrapper>
          </div>
        </div>
      </div>
    </div>
    <AppEventsSummary :events="events" />
  </div>
</template>
