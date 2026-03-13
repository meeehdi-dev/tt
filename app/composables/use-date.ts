import { StartOfWeekDay } from "~/types";
import { createSharedComposable } from "@vueuse/core";
import dayjs from "dayjs";

function useDate() {
  const startOfWeekDay = useCookie<StartOfWeekDay>("startOfWeekDay", {
    default: () => StartOfWeekDay.Monday,
  });

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
    currentWeek.value.startOf("week").add(startOfWeekDay.value, "day"),
  );
  const endOfWeek = computed(() =>
    currentWeek.value.endOf("week").add(startOfWeekDay.value, "day"),
  );

  const days = computed(() => getDays(startOfWeekDay.value));

  return {
    currentWeek,
    now,
    startOfWeekDay,
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
