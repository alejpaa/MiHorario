"use client";

import type { Course, DayName, Section } from "../types";
import { timeToMinutes } from "../lib/time";

const DAYS: DayName[] = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
const SHORT_DAYS: Record<DayName, string> = {
  LUNES: "LUN",
  MARTES: "MAR",
  MIERCOLES: "MIÉ",
  JUEVES: "JUE",
  VIERNES: "VIE",
  SABADO: "SÁB",
};

const START_HOUR = 7;
const END_HOUR = 22;

const COURSE_PALETTES = [
  { bg: "bg-emerald-100/90", border: "border-emerald-300", text: "text-emerald-950", badge: "bg-emerald-200 text-emerald-900" },
  { bg: "bg-sky-100/90", border: "border-sky-300", text: "text-sky-950", badge: "bg-sky-200 text-sky-900" },
  { bg: "bg-amber-100/90", border: "border-amber-300", text: "text-amber-950", badge: "bg-amber-200 text-amber-900" },
  { bg: "bg-indigo-100/90", border: "border-indigo-300", text: "text-indigo-950", badge: "bg-indigo-200 text-indigo-900" },
  { bg: "bg-violet-100/90", border: "border-violet-300", text: "text-violet-950", badge: "bg-violet-200 text-violet-900" },
  { bg: "bg-rose-100/90", border: "border-rose-300", text: "text-rose-950", badge: "bg-rose-200 text-rose-900" },
  { bg: "bg-teal-100/90", border: "border-teal-300", text: "text-teal-950", badge: "bg-teal-200 text-teal-900" },
  { bg: "bg-blue-100/90", border: "border-blue-300", text: "text-blue-950", badge: "bg-blue-200 text-blue-900" },
  { bg: "bg-fuchsia-100/90", border: "border-fuchsia-300", text: "text-fuchsia-950", badge: "bg-fuchsia-200 text-fuchsia-900" },
];

function getCoursePalette(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COURSE_PALETTES.length;
  return COURSE_PALETTES[index];
}

function shortenCourseName(name: string): string {
  const normalized = name.replace(/\s+/g, " ").trim();
  if (normalized.length <= 22) {
    return normalized;
  }
  const words = normalized.split(" ");
  if (words.length > 3) {
    return `${words.slice(0, 3).join(" ")}...`;
  }
  return `${normalized.slice(0, 20)}...`;
}

function getTeacherFirstSurname(rawTeacher: string): string {
  const clean = rawTeacher.replace(/^\s*[0-9A-Z]+\s*-\s*/i, "").trim();
  if (!clean || clean.toLowerCase() === "no asignado") {
    return "Sin docente";
  }

  const [lastNames] = clean.split(",");
  const firstSurname = lastNames.trim().split(/\s+/)[0];
  return firstSurname || "Sin docente";
}

interface ScheduleGridProps {
  selectedSections: Section[];
  courses: Course[];
  hoveredCourseCode?: string | null;
  onHoverCourse?: (code: string | null) => void;
}

export function ScheduleGrid({
  selectedSections,
  courses,
  hoveredCourseCode,
  onHoverCourse,
}: ScheduleGridProps) {
  const totalHours = END_HOUR - START_HOUR;
  const totalMinutes = totalHours * 60;

  const sectionCourseMap = new Map<string, Course>();
  for (const course of courses) {
    for (const section of course.sections) {
      sectionCourseMap.set(section.id, course);
    }
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="flex h-full min-h-[420px] min-w-[700px] flex-col xl:min-w-0">
          {/* Day Headers */}
          <div className="grid grid-cols-[52px_repeat(6,minmax(90px,1fr))] gap-1.5 text-xs font-bold text-slate-700 md:grid-cols-[60px_repeat(6,1fr)]">
            <div className="flex items-center justify-center text-[10px] uppercase text-slate-400 font-mono">
              Hora
            </div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="rounded-lg bg-slate-100 px-2 py-1.5 text-center text-slate-800 border border-slate-200/80 shadow-2xs flex items-center justify-center gap-1"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{SHORT_DAYS[day]}</span>
              </div>
            ))}
          </div>

          {/* Time & Slot Grid Area */}
          <div className="relative mt-1.5 grid min-h-0 flex-1 grid-cols-[52px_repeat(6,minmax(90px,1fr))] gap-1.5 md:grid-cols-[60px_repeat(6,1fr)]">
            {/* Time labels column */}
            <div className="relative h-full text-[10px] font-mono text-slate-400">
              {Array.from({ length: totalHours + 1 }, (_, index) => {
                const hour = START_HOUR + index;
                return (
                  <span
                    key={hour}
                    className="absolute left-1 -translate-y-1/2 select-none"
                    style={{ top: `${(index / totalHours) * 100}%` }}
                  >
                    {`${String(hour).padStart(2, "0")}:00`}
                  </span>
                );
              })}
            </div>

            {/* Day Columns */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="relative h-full rounded-lg border border-slate-200/60 bg-slate-50/50"
              >
                {/* Horizontal hour guidelines */}
                {Array.from({ length: totalHours + 1 }, (_, index) => (
                  <div
                    key={`${day}-${START_HOUR + index}`}
                    className="absolute left-0 right-0 border-t border-slate-200/40"
                    style={{ top: `${(index / totalHours) * 100}%` }}
                  />
                ))}

                {/* Course section blocks */}
                {selectedSections.flatMap((section) => {
                  const course = sectionCourseMap.get(section.id);
                  const isHovered = hoveredCourseCode && course?.code === hoveredCourseCode;
                  const palette = getCoursePalette(course?.code ?? section.id);

                  return section.timeSlots
                    .filter((slot) => slot.day === day)
                    .map((slot) => {
                      const startMinutes = timeToMinutes(slot.start);
                      const endMinutes = timeToMinutes(slot.end);
                      const startOffset = startMinutes - START_HOUR * 60;
                      const duration = endMinutes - startMinutes;
                      const top = (startOffset / totalMinutes) * 100;
                      const height = (duration / totalMinutes) * 100;

                      const showTeacher = duration >= 100;
                      const showSection = duration >= 75;

                      return (
                        <article
                          key={`${section.id}-${day}-${slot.start}`}
                          onMouseEnter={() => course && onHoverCourse?.(course.code)}
                          onMouseLeave={() => onHoverCourse?.(null)}
                          className={`absolute left-0.5 right-0.5 overflow-hidden rounded-lg border px-2 py-1 text-[10px] transition-all duration-150 shadow-2xs ${
                            palette.bg
                          } ${palette.border} ${
                            isHovered
                              ? "ring-2 ring-emerald-500 scale-[1.02] z-20 shadow-md"
                              : "hover:scale-[1.01] hover:z-10"
                          }`}
                          style={{ top: `${top}%`, height: `${height}%` }}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className={`truncate font-extrabold tracking-tight ${palette.text}`}>
                              {shortenCourseName(course?.name ?? course?.code ?? "Curso")}
                            </p>
                            {showSection && (
                              <span className={`shrink-0 rounded px-1 text-[9px] font-mono font-bold ${palette.badge}`}>
                                Sec {section.sectionNumber}
                              </span>
                            )}
                          </div>
                          {showTeacher && (
                            <p className="truncate text-[9px] text-slate-700 mt-0.5">
                              {getTeacherFirstSurname(section.teacher)}
                            </p>
                          )}
                          <p className="truncate font-mono text-[9px] text-slate-600 mt-0.5">
                            {slot.start} - {slot.end}
                          </p>
                        </article>
                      );
                    });
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


