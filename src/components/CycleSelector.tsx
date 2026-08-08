"use client";

import type { Course } from "../types";
import { DropdownMenu } from "./DropdownMenu";

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
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
            2
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Ciclo Académico
          </h2>
        </div>
      </div>

      {/* Cycle Selector */}
      <DropdownMenu
        label="Seleccionar ciclo"
        trigger={
          <span className="flex items-center gap-1.5">
            Ciclo {selectedCycle}
            <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        }
        triggerClassName="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-200/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        {(close) => (
          <div className="max-h-56 overflow-y-auto custom-scrollbar">
            {cycles.map((cycle) => {
              const isSelected = selectedCycle === cycle;
              return (
                <button
                  key={cycle}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCycleChange(cycle);
                    close();
                  }}
                  className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Ciclo {cycle}
                </button>
              );
            })}
          </div>
        )}
      </DropdownMenu>

      {/* Extra courses toggle */}
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        <label className="flex cursor-pointer items-center justify-between gap-2 text-xs font-medium text-slate-700">
          <span>Incluir cursos de otros ciclos</span>
          <input
            type="checkbox"
            checked={allowExtraCourses}
            onChange={(e) => onAllowExtraCoursesChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500/30"
          />
        </label>

        {allowExtraCourses && (
          <div className="mt-2 max-h-36 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2 custom-scrollbar">
            {outOfCycleCourses.length === 0 && (
              <p className="text-[11px] text-slate-500 text-center py-2">
                No hay otros cursos disponibles.
              </p>
            )}

            {outOfCycleCourses.map((course) => {
              const checked = extraCourseCodes.includes(course.code);
              return (
                <label
                  key={course.code}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-[11px] transition ${
                    checked
                      ? "bg-emerald-50 text-emerald-950 font-medium"
                      : "text-slate-700 hover:bg-slate-200/60"
                  }`}
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
                    className="mt-0.5 rounded border-slate-300 text-emerald-600"
                  />
                  <div>
                    <span className="font-mono font-bold text-emerald-700 mr-1.5">
                      {course.code}
                    </span>
                    <span>{course.name}</span>
                    <span className="ml-1.5 text-[9px] font-mono text-slate-500">
                      (C{course.cycle})
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}


