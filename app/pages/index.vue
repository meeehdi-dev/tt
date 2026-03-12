<script setup lang="ts">
import dayjs from "dayjs";

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

const { events, currentEvent, onSlotHover, addEvent, createEvent } =
  useEvents();

const slotHeight = shallowRef(0);
watch(slotsRef, () => {
  const el = slotsRef.value![0]!.$el as HTMLElement;
  const computedStyle = getComputedStyle(el);
  slotHeight.value =
    el.getBoundingClientRect().height -
    Number(computedStyle.borderTopWidth.slice(0, -2)) * 2;
});

useMousePressed({
  target: weekRef,
  onPressed: (e) => {
    const eventTarget = e.target as HTMLElement;

    const slot = getSlotFromElement(eventTarget);
    if (!slot) {
      return;
    }

    const day = Number(eventTarget.dataset.day);

    createEvent(day, slot);
  },
  onReleased: () => {
    if (!currentEvent.value) {
      return;
    }

    addEvent();
  },
});
</script>

<template>
  <ClientOnly>
    <div class="flex h-screen w-screen flex-col gap-1">
      <div class="mt-1 grid grid-cols-3">
        <div>
          <UButton
            :variant="
              currentWeekDate.isoWeek() === now.isoWeek() ? 'soft' : 'outline'
            "
            label="This week"
            class="ml-13 py-1"
            size="sm"
            :color="
              currentWeekDate.isoWeek() === now.isoWeek()
                ? 'primary'
                : 'neutral'
            "
            @click="currentWeekDate = dayjs()"
          />
        </div>
        <div class="flex justify-center">
          <WeekIndicator
            :date="currentWeekDate"
            @previous="currentWeekDate = currentWeekDate.subtract(1, 'week')"
            @next="currentWeekDate = currentWeekDate.add(1, 'week')"
          />
        </div>
        <div class="mr-2 flex items-center justify-end gap-2">
          <UButton
            icon="lucide:cog"
            color="secondary"
            variant="soft"
            size="sm"
          />
          <UPopover :content="{ side: 'bottom' }">
            <UButton
              icon="lucide:log-out"
              variant="soft"
              color="error"
              size="sm"
            />
            <template #content>
              <UButton icon="lucide:log-out" variant="soft" color="error"
                >Log out</UButton
              >
            </template>
          </UPopover>
          <UButton
            icon="lucide:github"
            color="neutral"
            variant="ghost"
            size="sm"
            href="https://github.com/meeehdi-dev/tt"
            target="_blank"
            rel="noopener noreferrer"
          />
        </div>
      </div>
      <div class="flex h-full w-full gap-2 px-1">
        <div class="grid h-full grid-rows-12">
          <TimeIndicator />
        </div>
        <div ref="week" class="grid h-full w-full grid-cols-7 gap-1">
          <div
            v-for="day in days"
            :key="day"
            class="relative grid h-full rounded-sm"
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
              class="pointer-events-none absolute grid h-full w-full grid-rows-24 gap-1"
            >
              <Event
                v-for="event in events.filter((e) => e.day === day)"
                :key="`${day}-${event.id}`"
                :event="event"
                :slot-height="slotHeight"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex w-full gap-2 px-1 pb-1">
        <div class="-translate-y-4">20:00</div>
        <div class="grid w-full grid-cols-7 gap-1">
          <DayProgress
            v-for="day in days"
            :key="`${day}-progress`"
            :day="day"
            :events="events"
          />
        </div>
      </div>
    </div>
    <EventModal />
  </ClientOnly>
</template>
