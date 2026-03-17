import type { ParsedScheduleData, SavedSchedule } from "../types";

const STORAGE_KEY = "horarios_unmsm_saved";
const SESSION_STORAGE_KEY = "horarios_unmsm_session";

export interface PlannerSession {
  data: ParsedScheduleData;
  selectedCycle: number;
  allowExtraCourses: boolean;
  extraCourseCodes: string[];
  selectedSections: Record<string, string>;
}

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

export function loadPlannerSession(): PlannerSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PlannerSession;
    if (!parsed.data || !Array.isArray(parsed.data.courses) || !Array.isArray(parsed.data.cycles)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePlannerSession(session: PlannerSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}
