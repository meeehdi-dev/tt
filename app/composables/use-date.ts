import "dayjs/plugin/isoWeek";
import { StartOfWeekDay } from "~/types";
import { createSharedComposable } from "@vueuse/core";
import dayjs from "dayjs";

function useDate() {
  const startOfWeekDay = useCookie<StartOfWeekDay>("startOfWeekDay", {
    default: () => StartOfWeekDay.Monday,
  });
  const startOfDay = useCookie<number>("startOfDay", {
    default: () => 8 * 60,
  });
  const endOfDay = useCookie<number>("endOfDay", {
    default: () => 20 * 60,
  });
  const workDayDuration = useCookie<number>("workDayDuration", {
    default: () => 8 * 60,
  });

  const currentWeek = ref(dayjs());
  const now = ref(dayjs());

  let nowTimeout = 0;
  onMounted(() => {
    nowTimeout = window.setInterval(() => {
      now.value = dayjs();
    }, 1000);
  });
  onUnmounted(() => {
    clearInterval(nowTimeout);
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

  const startOfWeek = computed(() => getStartOfWeek(currentWeek.value, startOfWeekDay.value));
  const endOfWeek = computed(() => getEndOfWeek(currentWeek.value, startOfWeekDay.value));

  const days = computed(() =>
    Array.from({ length: 7 }, (_, i) => startOfWeek.value.add(i, "day").format("YYYY-MM-DD")),
  );

  return {
    currentWeek,
    now,
    startOfWeekDay,
    startOfDay,
    endOfDay,
    workDayDuration,
    startOfWeek,
    endOfWeek,
    days,

    resetCurrentWeek,
    setPreviousWeek,
    setNextWeek,
  };
}

const useSharedDate = createSharedComposable(useDate);

export default useSharedDate;
