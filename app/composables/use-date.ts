import "dayjs/plugin/isoWeek";

import dayjs, { type Dayjs } from "dayjs";

import { StartOfWeekDay } from "~/types";

export default function useDate() {
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

  const currentWeekStr = useState<string>("currentWeek", () => dayjs().toISOString());
  const nowStr = useState<string>("now", () => dayjs().toISOString());

  const currentWeek = computed<Dayjs>({
    get: () => dayjs(currentWeekStr.value),
    set: (val) => {
      currentWeekStr.value = val.toISOString();
    },
  });

  const now = computed<Dayjs>({
    get: () => dayjs(nowStr.value),
    set: (val) => {
      nowStr.value = val.toISOString();
    },
  });

  let nowInterval: number | undefined;
  onMounted(() => {
    nowInterval = window.setInterval(() => {
      now.value = dayjs();
    }, 1000);
  });
  onUnmounted(() => {
    if (nowInterval) clearInterval(nowInterval);
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
