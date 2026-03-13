export type DayName =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO";

export interface TimeSlot {
  day: DayName;
  start: string;
  end: string;
}

export interface Section {
  id: string;
  sectionNumber: string;
  teacher: string;
  capacity?: number;
  enrolled?: number;
  timeSlots: TimeSlot[];
}

export interface Course {
  code: string;
  name: string;
  credits: number;
  cycle: number;
  sections: Section[];
}

export interface ParsedScheduleData {
  courses: Course[];
  cycles: number[];
  period?: string;
}

export interface Conflict {
  day: DayName;
  start: string;
  end: string;
  sectionAId: string;
  sectionBId: string;
}

export interface SavedSchedule {
  id: string;
  name: string;
  createdAt: string;
  selectedCycle: number;
  extraCourseCodes: string[];
  selectedSections: Record<string, string>;
}
