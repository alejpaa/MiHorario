"use client";

import type { Course } from "../types";

interface CycleSelectorProps {
  cycles: number[];
  selectedCycle: number;
  onCycleChange: (value: number) => void;
  allowExtraCourses: boolean;
  onAllowExtraCoursesChange: (value: boolean) => void;
  allCourses: Course[];
  extraCourseCodes: string[];
  onExtraCourseCodesChange: (codes: string[]) => void;
}

export function CycleSelector({
  cycles,
  selectedCycle,
  onCycleChange,
  allowExtraCourses,
  onAllowExtraCoursesChange,
  allCourses,
  extraCourseCodes,
  onExtraCourseCodesChange,
}: CycleSelectorProps) {
  const outOfCycleCourses = allCourses
    .filter((course) => course.cycle !== selectedCycle)
    .sort((a, b) => a.cycle - b.cycle || a.code.localeCompare(b.code));

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-800">2) Elige ciclo</p>

      <select
        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        value={selectedCycle}
        onChange={(event) => onCycleChange(Number(event.target.value))}
      >
        {cycles.map((cycle) => (
          <option key={cycle} value={cycle}>
            Ciclo {cycle}
          </option>
        ))}
      </select>

      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={allowExtraCourses}
          onChange={(event) => onAllowExtraCoursesChange(event.target.checked)}
        />
        Agregar cursos de otros ciclos (opcional)
      </label>

      {allowExtraCourses && (
        <div className="mt-3 max-h-40 space-y-2 overflow-auto rounded-lg border border-slate-200 p-2">
          {outOfCycleCourses.length === 0 && (
            <p className="text-xs text-slate-500">No hay cursos para mostrar.</p>
          )}

          {outOfCycleCourses.map((course) => {
            const checked = extraCourseCodes.includes(course.code);
            return (
              <label
                key={course.code}
                className="flex items-start gap-2 rounded-md px-2 py-1 text-xs hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onExtraCourseCodesChange([...extraCourseCodes, course.code]);
                    } else {
                      onExtraCourseCodesChange(
                        extraCourseCodes.filter((code) => code !== course.code),
                      );
                    }
                  }}
                />
                <span>
                  <span className="font-medium text-slate-800">{course.code}</span> - {course.name}
                  <span className="ml-2 text-slate-500">(Ciclo {course.cycle})</span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
