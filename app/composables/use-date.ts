import { createSharedComposable } from "@vueuse/core";
import dayjs from "dayjs";
import { StartOfWeekDay } from "~/types";

const startOfWeekOffset = StartOfWeekDay.Monday;

function useDate() {
  const currentWeek = useState("current", () => dayjs());
  const now = useState("now", () => dayjs());

  let nowTimeout = 0;
  onMounted(() => {
    nowTimeout = setInterval(() => {
      now.value = dayjs();
    }, 1000);
  });
  onUnmounted(() => {
    clearTimeout(nowTimeout);
  });

  function resetCurrentWeek() {
    currentWeek.value = dayjs();
  }

  function setPreviousWeek() {
    currentWeek.value = currentWeek.value.subtract(1, "week");
  }

  function setNextWeek() {
    currentWeek.value = currentWeek.value.add(1, "week");
  }

  const startOfWeek = computed(() =>
    currentWeek.value.startOf("week").add(startOfWeekOffset, "day"),
  );
  const endOfWeek = computed(() =>
    currentWeek.value.endOf("week").add(startOfWeekOffset, "day"),
  );

  return {
    currentWeek,
    now,
    startOfWeek,
    endOfWeek,

    resetCurrentWeek,
    setPreviousWeek,
    setNextWeek,
  };
}

const useSharedDate = createSharedComposable(useDate);

export default useSharedDate;
