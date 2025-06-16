<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import AppEvent from "./components/AppEvent.vue";

enum State {
  Idle = "idle",
  Grabbing = "grabbing",
  Focused = "focused",
  Selecting = "selecting",
}

interface SlotRange {
  day: number;
  start: number;
  end: number;
  note: string;
}

const times = Array(49)
  .fill(undefined)
  .map((_, i) => i / 2)
  .slice(16, -8);
const slots = times.slice(0, -1);
enum Day {
  // Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  // Saturday = 6,
}
const days = Object.values(Day).filter(Number) as number[];

const now = new Date();
const currentDayIndex = now.getDay();
const state = ref(State.Idle);
const startOfWeek = ref(new Date());
startOfWeek.value.setDate(startOfWeek.value.getDate() - currentDayIndex + 1);
const endOfWeek = ref(new Date());
endOfWeek.value.setDate(endOfWeek.value.getDate() + 5 - currentDayIndex);
const isMouseDown = ref(false);
const selectedSlots = ref<SlotRange>();
const activitySlots = ref<SlotRange[]>([]);
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

function getActivityKey() {
  return startOfWeek.value.toLocaleDateString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}
function load() {
  const activity = localStorage.getItem("activity-" + getActivityKey());
  if (activity) {
    activitySlots.value = JSON.parse(activity);
  } else {
    activitySlots.value = [];
  }
}
load();
function save() {
  localStorage.setItem(
    "activity-" + getActivityKey(),
    JSON.stringify(activitySlots.value.filter((a) => a.note !== "")),
  );
}

function getKey(day: number, slot: number) {
  return `${day}-${slot}`;
}

function onMouseDown(day: number, slot: number) {
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
  };
}

function onMouseUp() {
  if (![State.Selecting, State.Grabbing].includes(state.value)) {
    return;
  }
  state.value = State.Idle;
  if (!isMouseDown.value || !selectedSlots.value || isFocused.value) {
    return;
  }

  isMouseDown.value = false;

  if (isGrabbingTop.value || isGrabbingBottom.value) {
    isGrabbingTop.value = "";
    isGrabbingBottom.value = "";
    selectedSlots.value = undefined;
    save();
    return;
  }

  activitySlots.value.push({
    day: selectedSlots.value.day,
    start: selectedSlots.value.start,
    end: selectedSlots.value.end ?? selectedSlots.value.start,
    note: "",
  });
  save();

  selectedSlots.value = undefined;
}

function onMouseOver(slot: number) {
  if (![State.Selecting, State.Grabbing].includes(state.value)) {
    return;
  }

  if (state.value === State.Grabbing) {
    if (isGrabbingTop.value) {
      const activity = getActivityByKey(isGrabbingTop.value);
      if (slot > activity.end) {
        return;
      }
      activity.start = slot;
      isGrabbingTop.value = getKey(activity.day, activity.start);
      return;
    }
    if (isGrabbingBottom.value) {
      const activity = getActivityByKey(isGrabbingBottom.value);
      if (slot < activity.start) {
        return;
      }
      activity.end = slot;
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

function isActive(day: number, slot: number): boolean {
  const key = getKey(day, slot);
  return (
    activitySlots.value.find(
      ({ day: d, start }) => getKey(d, start) === key,
    ) !== undefined
  );
}

function getActivityByKey(key: string): SlotRange {
  // TODO: refactor this
  return (
    activitySlots.value.find(
      ({ day: d, start }) => getKey(d, start) === key,
    ) ?? {
      start: -1,
      end: -1,
      day: -1,
      note: "",
    }
  );
}

function getActivity(day: number, slot: number): SlotRange {
  const key = getKey(day, slot);
  // TODO: refactor this
  return (
    activitySlots.value.find(
      ({ day: d, start }) => getKey(d, start) === key,
    ) ?? {
      start: -1,
      end: -1,
      day: -1,
      note: "",
    }
  );
}

function getActivityLength(day: number, slot: number): number {
  const activitySlot = getActivity(day, slot);
  if (activitySlot.day === -1) {
    return 1;
  }

  const start = activitySlot.start;
  const end = activitySlot.end;

  return (end - start) * 2 + 1;
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
  const activity = getActivityByKey(key);
  if (activity.note == "" || window.confirm("Confirm?")) {
    activitySlots.value = activitySlots.value.filter(
      ({ day: d, start }) => getKey(d, start) !== key,
    );
    save();
  }
}

function onChange(day: number, slot: number) {
  const activity = getActivity(day, slot);
  activity.note = activity.note.trim();
  save();
}

function changeDate(days: number) {
  startOfWeek.value.setDate(startOfWeek.value.getDate() + days);
  endOfWeek.value.setDate(endOfWeek.value.getDate() + days);
  load();
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
    <div class="flex flex-row justify-between mb-1">
      <div class="ml-9 flex flex-row gap-1 items-center">
        <Icon
          icon="circum:timer"
          style="font-size: 1.5em"
          class="rotate-y-180 text-slate-700"
        />
        <span class="text-sm text-slate-600">tt</span>
      </div>
      <div class="flex flex-row justify-center items-center gap-2">
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
      <div
        class="text-slate-700 flex flex-row justify-center items-center hover:text-slate-600 cursor-pointer"
      >
        <a href="https://github.com/meeehdi-dev/tt" target="_blank">
          <Icon icon="carbon:logo-github" style="font-size: 1.5em" />
        </a>
      </div>
    </div>
    <div
      :class="[
        'flex flex-row flex-auto gap-1',
        { focused: isFocused !== '' },
      ]"
    >
      <div
        class="flex flex-initial flex-col justify-between text-xs text-slate-600 -mt-2 mb-2"
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
      <div class="week flex flex-auto flex-row gap-1">
        <div
          class="day flex flex-auto flex-col justify-around gap-0.5"
          v-bind:key="day"
          v-for="day in days"
        >
          <div
            v-bind:key="slot"
            v-for="slot in slots"
            :class="[
              'slot flex flex-auto bg-slate-100/10 rounded-xs cursor-pointer relative',
              {
                'bg-slate-100/30 cursor-pointer': isSelected(day, slot),
              },
            ]"
            :data-key="`${day}-${slot}`"
            @mousedown.left="onMouseDown(day, slot)"
            @mouseup.left="onMouseUp"
            @mouseover="onMouseOver(slot)"
          >
            <div
              v-if="isActive(day, slot)"
              :class="[
                'activity absolute w-full z-10 flex flex-auto flex-col bg-slate-300 text-slate-800 rounded-xs',
                {
                  'z-auto':
                    isGrabbingTop == getKey(day, slot) ||
                    isGrabbingBottom == getKey(day, slot),
                },
              ]"
              :style="{
                height: `calc(${slotHeight * getActivityLength(day, slot)}px + ${
                  0.125 * (getActivityLength(day, slot) - 1)
                }em)`,
              }"
            >
              <AppEvent
                v-model="getActivity(day, slot).note"
                @grab-top="onGrabTop(day, slot)"
                @grab-bottom="onGrabBottom(day, slot)"
                @remove="onRemove(day, slot)"
                @change="onChange(day, slot)"
                @focus="onFocus(day, slot)"
                @blur="onBlur"
              />
            </div>
          </div>
          <div class="flex flex-row justify-center">
            <div
              :class="[
                'group/summary text-slate-600 flex flex-row w-full gap-2 justify-center items-center relative text-xs',
                {
                  'cursor-pointer hover:text-slate-400':
                    activitySlots.filter((a) => a.day === day).length > 0,
                },
              ]"
            >
              <div
                class="group-hover/summary:opacity-100 group-hover/summary:z-10 opacity-0 transition-opacity absolute bottom-full flex flex-col justify-center items-end bg-slate-950 rounded-sm mb-1 text-xs px-4 py-2 gap-1"
                v-if="activitySlots.filter((a) => a.day === day).length > 0"
                v-html="
                  Object.entries(
                    activitySlots
                      .filter((a) => a.day === day)
                      .reduce(
                        (acc, cur) => {
                          cur.note.split('\n').forEach((line) => {
                            const matches = line.match(/#(\w+)/g);
                            if (matches) {
                              matches.forEach((match) => {
                                const tag = match.slice(1);
                                acc[tag] =
                                  (acc[tag] ?? 0) +
                                  getActivityLength(day, cur.start) / 2;
                              });
                            }
                          });
                          return acc;
                        },
                        {} as Record<string, number>,
                      ),
                  )
                    .map(([tag, value]) => {
                      return `<div class='flex flex-row gap-1'><span class='bg-sky-300 text-sky-800 font-bold rounded-sm
px-1'>${tag}</span> ${value.toFixed(1)}h</div>`;
                    })
                    .join('<br>')
                "
              ></div>
              <Icon icon="carbon:time-filled" /><span
                >{{
                  activitySlots
                    .filter((a) => a.day === day)
                    .reduce(
                      (acc, cur) => acc + getActivityLength(day, cur.start) / 2,
                      0,
                    )
                }}h</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
