// utils/formatTime.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("id");
export function formatToJakartaTime(dateString: string): string {
  return dayjs.utc(dateString).tz("Asia/Jakarta").format("HH:mm");
}

export function formatToJakartaDate(dateString: string): string {
  return dayjs.utc(dateString).tz("Asia/Jakarta").format("dddd, D MMMM YYYY");
}
dayjs.locale("id"); // ⬅️ Set bahasa ke Indonesia

export function formatToJakartaFullDateTime(iso: string | null): string {
  if (!iso) return "-";
  return dayjs.utc(iso).tz("Asia/Jakarta").format("D MMMM YYYY HH:mm");
}
