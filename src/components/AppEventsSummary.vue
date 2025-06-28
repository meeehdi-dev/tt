<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { days, WEEK_START, WEEK_END } from "@/util";
import { useEvents } from "@/compasables/useEvents";

const { events } = defineProps<{
  events: ReturnType<typeof useEvents>;
}>();

function getKey(day: number, slot: number) {
  return `${day}-${slot}`;
}

function getActivity(day: number, slot: number) {
  const key = getKey(day, slot);
  return events.data.value.find(
    ({ day: d, start }) => getKey(d, start) === key,
  );
}

function getActivityLength(day: number, slot: number): number {
  const activitySlot = getActivity(day, slot);
  if (!activitySlot) {
    return 0;
  }

  if (activitySlot.day === -1) {
    return 1;
  }

  const start = activitySlot.start;
  const end = activitySlot.end;

  return (end - start) * 2 + 1;
}
</script>

<template>
  <div :class="`ml-10 grid grid-cols-${WEEK_END - WEEK_START + 1}`">
    <div
      v-bind:key="day"
      v-for="day in days"
      :class="[
        'group/summary text-slate-600 flex flex-row gap-1 justify-center items-center relative text-xs p-1',
        {
          'cursor-pointer hover:text-slate-400':
            events.data.value.filter((a) => a.day === day).length > 0,
        },
      ]"
    >
      <Icon icon="carbon:time-filled" />
      <div>
        {{
          events.data.value
            .filter((a) => a.day === day)
            .reduce(
              (acc, cur) => acc + getActivityLength(cur.day, cur.start) / 2,
              0,
            )
        }}h
      </div>
      <div
        v-if="events.data.value.filter((a) => a.day === day).length > 0"
        class="group-hover/summary:opacity-100 group-hover/summary:z-10 opacity-0 transition-opacity absolute bottom-full flex flex-col justify-center items-end bg-slate-950 rounded-sm mb-1 text-xs px-4 py-2 gap-1"
        v-html="
          Object.entries(
            events.data.value
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
                          getActivityLength(cur.day, cur.start) / 2;
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
    </div>
  </div>
</template>
