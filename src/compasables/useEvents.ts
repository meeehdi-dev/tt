import type { SlotRange } from "@/util";
import { ref } from "vue";

export const useEvents = () => {
  const data = ref<SlotRange[]>([]);

  function getActivityKey(date: Date) {
    return date.toLocaleDateString(undefined, {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function load(date: Date) {
    const activity = localStorage.getItem("activity-" + getActivityKey(date));
    if (activity) {
      data.value = JSON.parse(activity);
    } else {
      data.value = [];
    }
  }

  function save(date: Date) {
    localStorage.setItem(
      "activity-" + getActivityKey(date),
      JSON.stringify(data.value.filter((e) => e.note !== "")),
    );
  }

  return {
    data,
    load,
    save,
  };
};
