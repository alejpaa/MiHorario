"use client";

import type { Course, Section } from "../types";
import { sectionsHaveConflict } from "../lib/conflict-checker";

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
}

function formatSlots(section: Section): string {
  return section.timeSlots.map((slot) => `${slot.day} ${slot.start}-${slot.end}`).join(" | ");
}

export function CourseList({
  courses,
  allCourses,
  selectedSections,
  onSelectSection,
  selectedSectionObjects,
  onConflictAttempt,
}: CourseListProps) {
  const sectionCourseMap = new Map<string, Course>();
  for (const course of allCourses) {
    for (const section of course.sections) {
      sectionCourseMap.set(section.id, course);
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between">
        <p className="text-sm font-semibold text-slate-800">3) Elige secciones</p>
        <p className="text-xs text-slate-500">Cursos: {courses.length}</p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {courses.map((course) => {
          return (
            <article key={course.code} className="rounded-xl border border-slate-200 p-2.5">
              <p className="text-xs text-slate-500">{course.code}</p>
              <p className="text-sm font-semibold text-slate-800">{course.name}</p>

              <div className="mt-2 space-y-2">
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
                          onConflictAttempt?.({
                            courseCode: course.code,
                            courseName: course.name,
                            sectionNumber: section.sectionNumber,
                            conflicts: conflictingSections,
                          });
                        }

                        onSelectSection(course.code, section.id);
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                        selected
                          ? "border-emerald-600 bg-emerald-50"
                          : hasConflict
                            ? "border-rose-300 bg-rose-50"
                            : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <p className="font-semibold text-slate-800">Seccion {section.sectionNumber}</p>
                      <p className="text-slate-600">Docente: {section.teacher}</p>
                      <p className="mt-1 text-slate-500">{formatSlots(section) || "Sin horario detectado"}</p>
                      {hasConflict && (
                        <p className="mt-1 text-rose-700">Se cruza con: {conflictSummary}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}

        {courses.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No hay cursos disponibles para este filtro.
          </p>
        )}
      </div>
    </section>
  );
}
