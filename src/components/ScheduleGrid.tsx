"use client";

import type { Course, DayName, Section } from "../types";
import { timeToMinutes } from "../lib/time";

const DAYS: DayName[] = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
const START_HOUR = 7;
const END_HOUR = 22;
const PIXELS_PER_HOUR = 36;
const COURSE_COLORS = [
  "hsl(16 85% 84%)",
  "hsl(35 88% 84%)",
  "hsl(55 85% 82%)",
  "hsl(95 58% 82%)",
  "hsl(146 58% 82%)",
  "hsl(184 64% 82%)",
  "hsl(214 78% 84%)",
  "hsl(256 78% 86%)",
  "hsl(302 68% 86%)",
  "hsl(340 70% 86%)",
];

function hashColor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COURSE_COLORS.length;
  return COURSE_COLORS[index];
}

function shortenCourseName(name: string): string {
  const normalized = name.replace(/\s+/g, " ").trim();
  if (normalized.length <= 26) {
    return normalized;
  }

  const words = normalized.split(" ");
  const shortByWords = words.slice(0, 4).join(" ");
  if (shortByWords.length <= 26) {
    return `${shortByWords}...`;
  }

  return `${normalized.slice(0, 24)}...`;
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
}

export function ScheduleGrid({ selectedSections, courses }: ScheduleGridProps) {
  const totalHeight = (END_HOUR - START_HOUR) * PIXELS_PER_HOUR;

  const sectionCourseMap = new Map<string, Course>();
  for (const course of courses) {
    for (const section of course.sections) {
      sectionCourseMap.set(section.id, course);
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-300 bg-white p-4 shadow-sm md:p-5">
      <p className="text-sm font-semibold text-slate-800">4) Vista de horario</p>

      <div className="mt-3 min-h-0 flex-1">
        <div className="h-full">
          <div className="grid grid-cols-[72px_repeat(6,1fr)] gap-2 text-xs font-semibold text-slate-600">
            <div />
            {DAYS.map((day) => (
              <div key={day} className="rounded-md bg-slate-100 px-2 py-2 text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-[72px_repeat(6,1fr)] gap-2">
            <div className="relative" style={{ height: `${totalHeight}px` }}>
              {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => {
                const hour = START_HOUR + index;
                return (
                  <span
                    key={hour}
                    className="absolute left-1 -translate-y-1/2 text-[10px] text-slate-500"
                    style={{ top: `${index * PIXELS_PER_HOUR}px` }}
                  >
                    {`${String(hour).padStart(2, "0")}:00`}
                  </span>
                );
              })}
            </div>

            {DAYS.map((day) => (
              <div key={day} className="relative rounded-lg border border-slate-200 bg-slate-50" style={{ height: `${totalHeight}px` }}>
                {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => (
                  <div
                    key={`${day}-${START_HOUR + index}`}
                    className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                    style={{ top: `${index * PIXELS_PER_HOUR}px` }}
                  />
                ))}

                {selectedSections.flatMap((section) => {
                  const course = sectionCourseMap.get(section.id);
                  return section.timeSlots
                    .filter((slot) => slot.day === day)
                    .map((slot) => {
                      const startMinutes = timeToMinutes(slot.start);
                      const endMinutes = timeToMinutes(slot.end);
                      const startOffset = startMinutes - START_HOUR * 60;
                      const duration = endMinutes - startMinutes;
                      const top = (startOffset / 60) * PIXELS_PER_HOUR;
                      const height = (duration / 60) * PIXELS_PER_HOUR;

                      return (
                        <article
                          key={`${section.id}-${day}-${slot.start}`}
                          className="absolute left-1 right-1 overflow-hidden rounded-md border border-slate-500/40 p-1 text-[10px]"
                          style={{ top: `${top}px`, height: `${height}px`, background: hashColor(course?.code ?? section.id) }}
                        >
                          <p className="truncate font-semibold text-slate-800">
                            {shortenCourseName(course?.name ?? course?.code ?? "Curso")}
                          </p>
                          <p className="truncate text-slate-700">Sec {section.sectionNumber}</p>
                          <p className="truncate text-slate-700">Prof. {getTeacherFirstSurname(section.teacher)}</p>
                          <p className="truncate text-slate-700">{slot.start}-{slot.end}</p>
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
