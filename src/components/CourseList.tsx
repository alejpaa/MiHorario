"use client";

import { useEffect, useRef, useState } from "react";
import type { Course, Section } from "../types";
import { sectionsHaveConflict } from "../lib/conflict-checker";
import { getCoursePalette } from "../lib/palette";
import { formatTeacherName } from "../lib/time";

interface ConflictingCourseItem {
  code: string;
  name: string;
  sectionNumber: string;
}

export interface ConflictSelectionNotice {
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  conflicts: ConflictingCourseItem[];
}

interface CourseListProps {
  courses: Course[];
  allCourses: Course[];
  selectedSections: Record<string, string>;
  onSelectSection: (courseCode: string, sectionId: string) => void;
  selectedSectionObjects: Section[];
  onConflictAttempt?: (notice: ConflictSelectionNotice) => void;
  hoveredCourseCode?: string | null;
  onHoverCourse?: (code: string | null) => void;
  revealCourseCode?: string | null;
  revealNonce?: number;
}

function formatSlots(section: Section): string {
  return section.timeSlots.map((slot) => `${slot.day.slice(0, 3)} ${slot.start}-${slot.end}`).join(" · ");
}

export function CourseList({
  courses,
  allCourses,
  selectedSections,
  onSelectSection,
  selectedSectionObjects,
  onConflictAttempt,
  hoveredCourseCode,
  onHoverCourse,
  revealCourseCode,
  revealNonce,
}: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingConflict, setPendingConflict] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!revealCourseCode) {
      return;
    }
    const element = listRef.current?.querySelector(
      `[data-course-code="${CSS.escape(revealCourseCode)}"]`,
    );
    element?.scrollIntoView({ block: "nearest" });
  }, [revealCourseCode, revealNonce]);

  const sectionCourseMap = new Map<string, Course>();
  for (const course of allCourses) {
    for (const section of course.sections) {
      sectionCourseMap.set(section.id, course);
    }
  }

  const filteredCourses = courses.filter((course) => {
    if (!searchTerm.trim()) {
      return true;
    }
    const term = searchTerm.toLowerCase().trim();
    return (
      course.code.toLowerCase().includes(term) ||
      course.name.toLowerCase().includes(term) ||
      course.sections.some((sec) => sec.teacher.toLowerCase().includes(term))
    );
  });

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
            3
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Cursos ({filteredCourses.length})
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {Object.keys(selectedSections).length} selecc.
        </span>
      </div>

      {/* Search Input */}
      <div className="mb-2.5 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar curso, código o docente..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Course & Section List */}
      <div ref={listRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
        {filteredCourses.map((course) => {
          const isSelectedCourse = Boolean(selectedSections[course.code]);
          const isHovered = hoveredCourseCode === course.code;
          const isRevealed = revealCourseCode === course.code;
          const palette = getCoursePalette(course.code);

          return (
            <article
              key={course.code}
              data-course-code={course.code}
              onMouseEnter={() => onHoverCourse?.(course.code)}
              onMouseLeave={() => onHoverCourse?.(null)}
              className={`rounded-xl border p-2.5 transition-all duration-150 ${
                isRevealed
                  ? "border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/40 shadow-lg course-reveal-flash"
                  : isSelectedCourse
                    ? `${palette.border} ${palette.bg}`
                    : isHovered
                      ? "border-slate-300 bg-slate-50"
                      : "border-slate-200 bg-white"
              }`}
            >
              {isRevealed && (
                <div className="mb-2 flex items-center justify-center rounded-lg bg-emerald-600 py-1 text-white shadow-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-sm ${palette.bg} ${palette.border}`}
                    />
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${palette.badge}`}>
                      {course.code}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                      Ciclo {course.cycle}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                      {course.credits} cr.
                    </span>
                  </div>
                  <h3 className="mt-0.5 text-xs font-bold text-slate-900 leading-snug">
                    {course.name}
                  </h3>
                </div>
              </div>

              {/* Sections list */}
              <div className="mt-2 space-y-1.5">
                {course.sections.map((section) => {
                  const selected = selectedSections[course.code] === section.id;
                  const conflictingSections: Array<{ code: string; name: string; sectionNumber: string }> = [];

                  for (const current of selectedSectionObjects) {
                    if (current.id === section.id) {
                      continue;
                    }
                    if (current.id.startsWith(`${course.code}-`)) {
                      continue;
                    }

                    if (sectionsHaveConflict(current, section).length === 0) {
                      continue;
                    }

                    const conflictCourse = sectionCourseMap.get(current.id);
                    conflictingSections.push({
                      code: conflictCourse?.code ?? current.id,
                      name: conflictCourse?.name ?? "Curso seleccionado",
                      sectionNumber: current.sectionNumber,
                    });
                  }

                  const hasConflict = conflictingSections.length > 0;
                  const conflictSummary = conflictingSections
                    .map((item) => `${item.code} (Sec ${item.sectionNumber})`)
                    .join(", ");

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        if (hasConflict && !selected) {
                          if (pendingConflict !== section.id) {
                            setPendingConflict(section.id);
                            onConflictAttempt?.({
                              courseCode: course.code,
                              courseName: course.name,
                              sectionNumber: section.sectionNumber,
                              conflicts: conflictingSections,
                            });
                            return;
                          }
                          setPendingConflict(null);
                        }

                        onSelectSection(course.code, section.id);
                      }}
                      className={`group w-full rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        selected
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-medium shadow-2xs"
                          : hasConflict
                            ? "border-rose-300 bg-rose-50 text-rose-900 hover:border-rose-400 hover:bg-rose-100/50"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                      }`}

                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          {selected && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          )}
                          Sección {section.sectionNumber}
                        </span>
                        {section.capacity && (
                          <span className="text-[9px] font-mono text-slate-500">
                            {section.enrolled ?? 0}/{section.capacity} vac.
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 truncate text-[10px] text-slate-600 font-medium">
                        {formatTeacherName(section.teacher)}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                        {formatSlots(section) || "Horario pendiente"}
                      </p>

                      {hasConflict && (
                        <p className="mt-1 text-[10px] font-bold text-rose-700 flex items-center gap-1">
                          <span>⚠ Cruce con:</span>
                          <span className="font-mono text-[9px] truncate">{conflictSummary}</span>
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
            No se encontraron cursos con el filtro actual.
          </div>
        )}
      </div>
    </section>
  );
}


