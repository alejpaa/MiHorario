"use client";

import type { Course, Section } from "../types";
import { sectionsHaveConflict } from "../lib/conflict-checker";

interface CourseListProps {
  courses: Course[];
  selectedSections: Record<string, string>;
  onSelectSection: (courseCode: string, sectionId: string) => void;
  selectedSectionObjects: Section[];
}

function formatSlots(section: Section): string {
  return section.timeSlots.map((slot) => `${slot.day} ${slot.start}-${slot.end}`).join(" | ");
}

export function CourseList({
  courses,
  selectedSections,
  onSelectSection,
  selectedSectionObjects,
}: CourseListProps) {
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
                  const hasConflict = selectedSectionObjects.some((current) => {
                    if (current.id === section.id) {
                      return false;
                    }
                    if (current.id.startsWith(`${course.code}-`)) {
                      return false;
                    }
                    return sectionsHaveConflict(current, section).length > 0;
                  });

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => onSelectSection(course.code, section.id)}
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
