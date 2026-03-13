import type { SavedSchedule } from "../types";

const STORAGE_KEY = "horarios_unmsm_saved";

export function loadSchedules(): SavedSchedule[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as SavedSchedule[];
  } catch {
    return [];
  }
}

export function saveSchedules(items: SavedSchedule[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
