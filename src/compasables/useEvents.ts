import type { SlotRange } from "@/util";
import { ref } from "vue";

export function getKey(day: number, slot: number) {
  return `${day}-${slot}`;
}

export const useEvents = () => {
  const data = ref<SlotRange[]>([]);

  function getWeekEventsKey(date: Date) {
    return date.toLocaleDateString(undefined, {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function load(date: Date) {
    const activity = localStorage.getItem("activity-" + getWeekEventsKey(date));
    if (activity) {
      data.value = JSON.parse(activity);
      // NOTE: add duration for old data
      data.value.forEach((e) => {
        e.duration = e.end - e.start + 0.5;
      });
      console.log(data.value);
    } else {
      data.value = [];
    }
  }

  function save(date: Date) {
    localStorage.setItem(
      "activity-" + getWeekEventsKey(date),
      JSON.stringify(data.value.filter((e) => e.note !== "")),
    );
  }

  function getByKey(key: string) {
    return data.value.find(({ day: d, start }) => getKey(d, start) === key);
  }

  function getBySlot(day: number, slot: number) {
    return getByKey(getKey(day, slot));
  }

  return {
    data,
    getByKey,
    getBySlot,
    load,
    save,
  };
};
