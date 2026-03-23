import type { Dayjs } from "dayjs";
import type { StartOfWeekDay } from "~/types";

export function getShortDateLabel(date: Dayjs) {
  return date.toDate().toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
  });
}

export function getStartOfWeek(date: Dayjs, startOfWeekDay: StartOfWeekDay): Dayjs {
  const currentDay = date.day();
  const daysToSubtract = (currentDay - startOfWeekDay + 7) % 7;
  return date.subtract(daysToSubtract, "day").startOf("day");
}

export function getEndOfWeek(date: Dayjs, startOfWeekDay: StartOfWeekDay): Dayjs {
  return getStartOfWeek(date, startOfWeekDay).add(6, "day").endOf("day");
}

export function formatPeriodLabel(date: Dayjs, period: "week" | "month" | "year", startOfWeekDay?: StartOfWeekDay) {
  if (period === "week") {
    const start = startOfWeekDay !== undefined ? getStartOfWeek(date, startOfWeekDay) : date.startOf("isoWeek");
    const end = startOfWeekDay !== undefined ? getEndOfWeek(date, startOfWeekDay) : date.endOf("isoWeek");
    return `Week ${date.isoWeek()} | ${getShortDateLabel(start)} - ${getShortDateLabel(end)}`;
  }
  if (period === "month") {
    return date.format("MMMM YYYY");
  }
  if (period === "year") {
    return date.format("YYYY");
  }
  return "";
}
