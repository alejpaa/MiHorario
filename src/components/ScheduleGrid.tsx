"use client";

import { useMemo } from "react";
import type { Course, DayName, Section, TimeSlot } from "../types";
import { formatTeacherName, timeToMinutes } from "../lib/time";
import { getCoursePalette } from "../lib/palette";

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

function mergeContiguousSlots(timeSlots: TimeSlot[]): TimeSlot[] {
  const sorted = [...timeSlots].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
  );
  const merged: TimeSlot[] = [];

  for (const slot of sorted) {
    const last = merged[merged.length - 1];
    if (last && last.day === slot.day && last.end === slot.start) {
      last.end = slot.end;
    } else {
      merged.push({ ...slot });
    }
  }

  return merged;
}

interface ScheduleGridProps {
  selectedSections: Section[];
  courses: Course[];
  hoveredCourseCode?: string | null;
  onHoverCourse?: (code: string | null) => void;
  onClickCourse?: (code: string) => void;
  interactive?: boolean;
}

export function ScheduleGrid({
  selectedSections,
  courses,
  hoveredCourseCode,
  onHoverCourse,
  onClickCourse,
  interactive = true,
}: ScheduleGridProps) {
  const totalHours = END_HOUR - START_HOUR;
  const totalMinutes = totalHours * 60;

  const sectionCourseMap = new Map<string, Course>();
  for (const course of courses) {
    for (const section of course.sections) {
      sectionCourseMap.set(section.id, course);
    }
  }

  const mergedSections = useMemo(
    () =>
      selectedSections.map((section) => ({
        ...section,
        timeSlots: mergeContiguousSlots(section.timeSlots),
      })),
    [selectedSections],
  );

  return (
    <section className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 shadow-sm">
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="flex h-full w-full min-w-[560px] md:min-w-0 flex-col">
          {/* Day Headers */}
          <div className="grid grid-cols-[48px_repeat(6,minmax(0,1fr))] gap-1.5 text-xs font-bold text-slate-700">
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
          <div className="relative mt-1.5 grid min-h-0 flex-1 grid-rows-1 grid-cols-[48px_repeat(6,minmax(0,1fr))] gap-1.5">
            {/* Time labels column */}
            <div className="relative h-full text-[10px] font-mono text-slate-400">
              {Array.from({ length: totalHours + 1 }, (_, index) => {
                const hour = START_HOUR + index;
                const isFirst = index === 0;
                const isLast = index === totalHours;
                return (
                  <span
                    key={hour}
                    className={`absolute left-1 select-none ${
                      isLast ? "-translate-y-full" : isFirst ? "translate-y-0" : "-translate-y-1/2"
                    }`}
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
                {mergedSections.flatMap((section) => {
                  const course = sectionCourseMap.get(section.id);
                  const isHovered = hoveredCourseCode && course?.code === hoveredCourseCode;
                  const palette = getCoursePalette(course?.code ?? section.id);
                  const teacherFullName = formatTeacherName(section.teacher);

                  return section.timeSlots
                    .filter((slot) => slot.day === day)
                    .map((slot) => {
                      const startMinutes = timeToMinutes(slot.start);
                      const endMinutes = timeToMinutes(slot.end);
                      const startOffset = startMinutes - START_HOUR * 60;
                      const duration = endMinutes - startMinutes;
                      const top = (startOffset / totalMinutes) * 100;
                      const height = (duration / totalMinutes) * 100;

                      const showTeacher = duration >= 45;
                      const showSection = duration >= 60;
                      const isHuge = duration >= 180;
                      const isTall = duration >= 100;

                      const nameSize = isHuge
                        ? "text-sm sm:text-base font-extrabold leading-snug"
                        : isTall
                        ? "text-xs sm:text-sm font-extrabold leading-snug"
                        : "text-[11px] font-bold leading-tight";

                      const metaSize = isHuge
                        ? "text-xs font-semibold"
                        : isTall
                        ? "text-[11px] font-semibold"
                        : "text-[10px] font-medium";

                      const badgeSize = isHuge
                        ? "text-xs px-1.5 py-0.5 rounded-md"
                        : isTall
                        ? "text-[10px] px-1 py-0.5 rounded"
                        : "text-[9px] px-1 rounded";

                      const courseLabel = course?.name ?? course?.code ?? "Curso sin nombre";
                      const blockLabel = `${courseLabel}, Sección ${section.sectionNumber}, ${day}, ${slot.start} - ${slot.end}${course ? `, ${course.code}` : ""}, Docente: ${teacherFullName}`;

                      const blockHandlers = interactive
                        ? {
                            onMouseEnter: () => course && onHoverCourse?.(course.code),
                            onMouseLeave: () => onHoverCourse?.(null),
                            onFocus: () => course && onHoverCourse?.(course.code),
                            onBlur: () => onHoverCourse?.(null),
                            onClick: () => course && onClickCourse?.(course.code),
                            tabIndex: 0,
                            role: "img",
                            "aria-label": blockLabel,
                          }
                        : {};

                      return (
                        <article
                          key={`${section.id}-${day}-${slot.start}`}
                          {...blockHandlers}
                          className={`absolute left-0.5 right-0.5 flex flex-col justify-between overflow-hidden rounded-lg border animate-schedule-block transition-all duration-200 ease-out shadow-2xs ${
                            isHuge
                              ? "p-3 gap-1.5"
                              : isTall
                              ? "p-2.5 gap-1"
                              : "p-1.5 gap-0.5"
                          } ${interactive
                            ? "outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 cursor-pointer active:scale-[0.98]"
                            : ""
                          } ${palette.bg} ${palette.border} ${
                            interactive
                              ? isHovered
                                ? "ring-2 ring-emerald-500 scale-[1.03] z-20 shadow-md"
                                : "hover:scale-[1.01] hover:z-10 hover:shadow-xs"
                              : ""
                          }`}
                          style={{ top: `${top}%`, height: `${height}%` }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className={`flex-1 min-w-0 tracking-tight break-words ${palette.text} ${nameSize}`}>
                              {course?.name ?? course?.code ?? "Curso"}
                            </p>
                            {showSection && (
                              <div className="flex flex-col items-end gap-0.5 shrink-0">
                                <span className={`font-mono font-bold ${palette.badge} ${badgeSize}`}>
                                  Sec {section.sectionNumber}
                                </span>
                                {isHuge && course?.code && (
                                  <span className="font-mono text-[10px] text-slate-500 font-semibold">
                                    {course.code}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-0.5">
                            {showTeacher && (
                              <p className={`text-slate-800 leading-tight break-words ${metaSize}`}>
                                {teacherFullName}
                              </p>
                            )}
                            <p className={`font-mono text-slate-600 leading-tight ${metaSize}`}>
                              {slot.start} - {slot.end}
                            </p>
                          </div>
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


