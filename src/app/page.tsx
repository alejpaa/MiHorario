"use client";

import { useEffect, useMemo, useState } from "react";
import { AppAlert } from "../components/AppAlert";
import { CourseList, type ConflictSelectionNotice } from "../components/CourseList";
import { CycleSelector } from "../components/CycleSelector";
import { DropdownMenu } from "../components/DropdownMenu";
import { PDFUploader } from "../components/PDFUploader";
import { SavedSchedules } from "../components/SavedSchedules";
import { ScheduleExportModal } from "../components/ScheduleExportModal";
import { ScheduleGrid } from "../components/ScheduleGrid";
import { getAllConflicts } from "../lib/conflict-checker";
import { parseUniversityPdf } from "../lib/pdf-parser";
import { generateSchedules } from "../lib/schedule-solver";
import { SAMPLE_UNMSM_DATA } from "../lib/sample-data";
import {
  loadPlannerSession,
  loadSchedules,
  savePlannerSession,
  saveSchedules,
} from "../lib/storage";
import type { Course, ParsedScheduleData, SavedSchedule, Section } from "../types";

const DAY_ORDER = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"] as const;

interface ScheduleOptionSummary {
  courseCount: number;
  occupiedDays: boolean[];
  freeDayCount: number;
}

function getSectionById(courses: Course[], sectionId: string): Section | undefined {
  for (const course of courses) {
    const found = course.sections.find((section) => section.id === sectionId);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function summarizeOption(option: Record<string, string>, courses: Course[]): ScheduleOptionSummary {
  const occupied = Array<boolean>(DAY_ORDER.length).fill(false);
  let courseCount = 0;

  for (const sectionId of Object.values(option)) {
    courseCount += 1;
    const section = getSectionById(courses, sectionId);
    if (!section) {
      continue;
    }
    for (const slot of section.timeSlots) {
      const dayIndex = DAY_ORDER.indexOf(slot.day as (typeof DAY_ORDER)[number]);
      if (dayIndex >= 0) {
        occupied[dayIndex] = true;
      }
    }
  }

  return {
    courseCount,
    occupiedDays: occupied,
    freeDayCount: occupied.filter((value) => !value).length,
  };
}

export default function Home() {
  const [data, setData] = useState<ParsedScheduleData | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<number>(7);
  const [allowExtraCourses, setAllowExtraCourses] = useState(false);
  const [extraCourseCodes, setExtraCourseCodes] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<Record<string, string>>({});
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [autoOptions, setAutoOptions] = useState<Record<string, string>[]>([]);
  const [autoIndex, setAutoIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [conflictNotice, setConflictNotice] = useState<ConflictSelectionNotice | null>(null);
  const [hoveredCourseCode, setHoveredCourseCode] = useState<string | null>(null);
  const [revealCourseCode, setRevealCourseCode] = useState<string | null>(null);
  const [revealNonce, setRevealNonce] = useState(0);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [solveNotice, setSolveNotice] = useState<{ tone: "success" | "info"; title: string; description: string } | null>(null);
  const [undoableDelete, setUndoableDelete] = useState<{ item: SavedSchedule; index: number } | null>(null);

  useEffect(() => {
    setSavedSchedules(loadSchedules());
    const session = loadPlannerSession();
    if (session) {
      setData(session.data);
      setSelectedCycle(session.selectedCycle);
      setAllowExtraCourses(session.allowExtraCourses);
      setExtraCourseCodes(session.extraCourseCodes);
      setSelectedSections(session.selectedSections);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !data) {
      return;
    }

    savePlannerSession({
      data,
      selectedCycle,
      allowExtraCourses,
      extraCourseCodes,
      selectedSections,
    });
  }, [allowExtraCourses, data, extraCourseCodes, hydrated, selectedCycle, selectedSections]);

  const activeCourses = useMemo(() => {
    if (!data) {
      return [];
    }

    const main = data.courses.filter((course) => course.cycle === selectedCycle);

    if (!allowExtraCourses) {
      return main;
    }

    const extra = data.courses.filter((course) => extraCourseCodes.includes(course.code));
    const map = new Map<string, Course>();
    for (const course of [...main, ...extra]) {
      map.set(course.code, course);
    }

    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [allowExtraCourses, data, extraCourseCodes, selectedCycle]);

  const selectedSectionObjects = useMemo(() => {
    if (!data) {
      return [];
    }

    return Object.values(selectedSections)
      .map((sectionId) => getSectionById(data.courses, sectionId))
      .filter((item): item is Section => Boolean(item));
  }, [data, selectedSections]);

  const conflicts = useMemo(() => getAllConflicts(selectedSectionObjects), [selectedSectionObjects]);

  const optionSummaries = useMemo(
    () => autoOptions.map((option) => summarizeOption(option, activeCourses)),
    [activeCourses, autoOptions],
  );

  const parsePdf = async (file: File) => {
    setLoadingPdf(true);
    setError(null);

    try {
      const parsed = await parseUniversityPdf(file);
      if (parsed.courses.length === 0) {
        throw new Error("No se detectaron cursos en el PDF.");
      }

      setData(parsed);
      setSelectedSections({});
      setAutoOptions([]);
      setAutoIndex(0);

      if (parsed.cycles.length > 0) {
        setSelectedCycle(parsed.cycles.includes(7) ? 7 : parsed.cycles[0]);
      }
    } catch (pdfError) {
      setError(
        pdfError instanceof Error
          ? pdfError.message
          : "No se pudo procesar el PDF. Verifica el formato.",
      );
    } finally {
      setLoadingPdf(false);
    }
  };

  const loadSampleData = () => {
    setData(SAMPLE_UNMSM_DATA);
    setSelectedSections({});
    setAutoOptions([]);
    setAutoIndex(0);
    setSelectedCycle(7);
  };

  const selectSection = (courseCode: string, sectionId: string) => {
    setConflictNotice(null);
    setSelectedSections((prev) => {
      if (prev[courseCode] === sectionId) {
        const next = { ...prev };
        delete next[courseCode];
        return next;
      }
      return { ...prev, [courseCode]: sectionId };
    });
  };

  const runAutoGeneration = () => {
    const options = generateSchedules(activeCourses, 20);
    setAutoOptions(options);
    setAutoIndex(0);

    if (options.length === 0) {
      setSelectedSections({});
      setSolveNotice({
        tone: "info",
        title: "No se encontró una combinación sin cruces",
        description: "Reduce la cantidad de cursos, revisa los cruces marcados o incluye cursos de otros ciclos para dar más margen al planificador.",
      });
      return;
    }

    setSelectedSections(options[0]);
    setSolveNotice({
      tone: "success",
      title: `Se generaron ${options.length} opciones sin cruces`,
      description: "Revisa la lista de opciones y elige la que mejor te acomode; cada tarjeta muestra los días que ocupas.",
    });
  };

  const loadAutoOption = (nextIndex: number) => {
    if (!autoOptions[nextIndex]) {
      return;
    }
    setAutoIndex(nextIndex);
    setSelectedSections(autoOptions[nextIndex]);
  };

  const openSaveModal = () => {
    setScheduleName(`Horario UNMSM ${savedSchedules.length + 1}`);
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    const name = scheduleName.trim() || `Horario UNMSM ${savedSchedules.length + 1}`;

    const item: SavedSchedule = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      selectedCycle,
      extraCourseCodes,
      selectedSections,
    };

    const next = [item, ...savedSchedules];
    setSavedSchedules(next);
    saveSchedules(next);
    setShowSaveModal(false);
    setSolveNotice({
      tone: "success",
      title: "Horario guardado",
      description: `"${name}" se guardó en tu lista.`,
    });
  };

  const loadSaved = (item: SavedSchedule) => {
    setSelectedCycle(item.selectedCycle);
    setAllowExtraCourses(item.extraCourseCodes.length > 0);
    setExtraCourseCodes(item.extraCourseCodes);
    setSelectedSections(item.selectedSections);
  };

  const deleteSaved = (id: string) => {
    const index = savedSchedules.findIndex((item) => item.id === id);
    if (index === -1) {
      return;
    }
    const deleted = savedSchedules[index];
    const next = savedSchedules.filter((item) => item.id !== id);
    setSavedSchedules(next);
    saveSchedules(next);
    setUndoableDelete({ item: deleted, index });
  };

  const undoDelete = () => {
    if (!undoableDelete) {
      return;
    }
    const { item, index } = undoableDelete;
    const next = [...savedSchedules];
    next.splice(Math.min(index, next.length), 0, item);
    setSavedSchedules(next);
    saveSchedules(next);
    setUndoableDelete(null);
  };

  const handleConflictAttempt = (notice: ConflictSelectionNotice) => {
    setConflictNotice(notice);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/*
        THESIS: Single-viewport (100vh) UNMSM Schedule Solver workspace that replaces dark/neon aggressive styles with a clean, light, minimalist slate & pastel workspace.
        OWN-WORLD: Slate & Emerald light theme, white cards, subtle border strokes (border-slate-200), soft pastel schedule grid blocks, crisp high-contrast typography.
        STORY: Student drops official UNMSM PDF, filters by cycle, picks/solves non-overlapping section combinations, and saves schedule presets without page scroll or visual clutter.
        FIRST VIEWPORT: Top compact light header bar with cycle pills & saved schedule drawer button; Left fixed white sidebar for course search & section accordion cards; Right main area for auto-solver toolbar and 100% viewport-scaled weekly timetable.
        FORM: Single-viewport minimalist workspace dashboard.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
      */}

      {/* Header Bar */}
      <header className="h-14 shrink-0 px-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 font-black text-white text-xs shadow-2xs">
              MH
            </span>
            <h1 className="font-extrabold text-sm md:text-base text-slate-900 tracking-tight">
              MiHorario <span className="font-mono text-emerald-700 text-xs font-bold">UNMSM</span>
            </h1>
          </div>

          {data && (
            <div className="hidden md:flex items-center gap-2 text-xs border-l border-slate-200 pl-3">
              {data.school && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                  {data.school}
                </span>
              )}
              {data.period && (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-800">
                  {data.period}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            aria-expanded={showHelp}
            aria-label="Ayuda sobre cómo funciona MiHorario"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            ?
          </button>

          {data && (
            <button
              type="button"
              onClick={() => setShowSavedModal((prev) => !prev)}
              className="relative flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition"
            >
              <span>★ Guardados</span>
              {savedSchedules.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {savedSchedules.length}
                </span>
              )}
            </button>
          )}

          {data && (
            <button
              type="button"
              onClick={() => setData(null)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Cambiar PDF
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Body */}
      {!data ? (
        /* Empty / Initial State */
        <div className="flex-1 min-h-0 flex items-center justify-center p-4">
          <div className="w-full max-w-xl space-y-4">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
                {error}
              </div>
            )}
            <PDFUploader onFileSelected={parsePdf} loading={loadingPdf} onLoadSample={loadSampleData} />
          </div>
        </div>
      ) : (
        /* Active 100vh Workspace */
        <div className="flex-1 min-h-0 flex overflow-hidden relative">
          {/* Left Control & Course Picker Sidebar */}
          <aside className="w-80 md:w-96 shrink-0 h-full flex flex-col border-r border-slate-200 bg-white p-3 gap-3 overflow-hidden shadow-2xs">
            <div className="shrink-0">
              <CycleSelector
                cycles={data.cycles}
                selectedCycle={selectedCycle}
                onCycleChange={setSelectedCycle}
                allowExtraCourses={allowExtraCourses}
                onAllowExtraCoursesChange={setAllowExtraCourses}
                allCourses={data.courses}
                extraCourseCodes={extraCourseCodes}
                onExtraCourseCodesChange={setExtraCourseCodes}
              />
            </div>

            <div className="min-h-0 flex-1">
              <CourseList
                courses={activeCourses}
                allCourses={data.courses}
                selectedSections={selectedSections}
                onSelectSection={selectSection}
                selectedSectionObjects={selectedSectionObjects}
                onConflictAttempt={handleConflictAttempt}
                hoveredCourseCode={hoveredCourseCode}
                onHoverCourse={setHoveredCourseCode}
                revealCourseCode={revealCourseCode}
                revealNonce={revealNonce}
              />
            </div>
          </aside>

          {/* Right Main Timetable Area */}
          <main className="flex-1 h-full flex flex-col min-w-0 bg-slate-50 p-3 gap-3 overflow-hidden">
            {/* Top Solver & Action Bar */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runAutoGeneration}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.97] shadow-2xs transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generar Horarios Sin Cruces</span>
                </button>

                <button
                  type="button"
                  onClick={openSaveModal}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition"
                >
                  ★ Guardar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedSectionObjects.length === 0) {
                      setSolveNotice({
                        tone: "info",
                        title: "Nada que exportar",
                        description: "Selecciona al menos un curso antes de exportar tu horario.",
                      });
                      return;
                    }
                    setShowExportModal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Exportar</span>
                </button>
              </div>

              {/* Solver option selector: compact dropdown */}
              {autoOptions.length > 0 && (
                <DropdownMenu
                  align="right"
                  label="Seleccionar opción de horario"
                  trigger={
                    <span className="flex items-center gap-1.5">
                      <span className="font-extrabold text-emerald-800">
                        Opción {autoIndex + 1} de {autoOptions.length}
                      </span>
                      <span className="font-semibold text-slate-500">
                        {optionSummaries[autoIndex].courseCount} cursos ·{" "}
                        {optionSummaries[autoIndex].freeDayCount} libre(s)
                      </span>
                      <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  }
                  triggerClassName="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {(close) => (
                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                      {autoOptions.map((option, index) => {
                        const isCurrent = autoIndex === index;
                        const summary = optionSummaries[index];
                        const freeDays = DAY_ORDER.filter(
                          (_, dayIndex) => !summary.occupiedDays[dayIndex],
                        );
                        return (
                          <button
                            key={index}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              loadAutoOption(index);
                              close();
                            }}
                            className={`block w-full rounded-lg px-2.5 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                              isCurrent
                                ? "bg-emerald-50"
                                : "hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-xs font-extrabold ${isCurrent ? "text-emerald-800" : "text-slate-800"}`}>
                                Opción {index + 1}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {summary.courseCount} cursos · {summary.freeDayCount} libre(s)
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex gap-[3px]">
                                {summary.occupiedDays.map((occupied, dayIndex) => (
                                  <span
                                    key={dayIndex}
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      occupied ? "bg-emerald-500" : "bg-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {summary.freeDayCount > 0 && (
                                <span className="text-[9px] font-semibold text-emerald-700">
                                  libre {freeDays.map((d) => d.slice(0, 3)).join(", ")}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </DropdownMenu>
              )}

              {/* Conflict Status Pill */}
              {conflicts.length > 0 && (
                <span className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  {conflicts.length} cruce(s) detectado(s)
                </span>
              )}
            </div>

            {/* Schedule Grid Container */}
            <div className="flex-1 min-h-0 w-full relative">
              <ScheduleGrid
                selectedSections={selectedSectionObjects}
                courses={activeCourses}
                hoveredCourseCode={hoveredCourseCode}
                onHoverCourse={setHoveredCourseCode}
                onClickCourse={(code) => {
                  setHoveredCourseCode(code);
                  setRevealCourseCode(code);
                  setRevealNonce((value) => value + 1);
                }}
              />
            </div>
          </main>

          {/* Saved Schedules Overlay Drawer */}
          {showSavedModal && (
            <div className="absolute right-4 top-16 z-50 w-80 h-[calc(100%-80px)]">
              <SavedSchedules
                items={savedSchedules}
                onLoad={loadSaved}
                onDelete={deleteSaved}
                onClose={() => setShowSavedModal(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Conflict Alert Notice */}
      {conflictNotice && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 w-[min(92vw,420px)]">
          <div className="pointer-events-auto shadow-xl">
            <AppAlert
              tone="warning"
              title={`Cruce detectado en ${conflictNotice.courseCode} - Sec ${conflictNotice.sectionNumber}`}
              description="Esta selección genera solapamiento de horario. Haz clic dos veces si quieres forzarla."
              items={conflictNotice.conflicts.map(
                (item) => `${item.code} - ${item.name} (Sec ${item.sectionNumber})`,
              )}
              onClose={() => setConflictNotice(null)}
            />
          </div>
        </div>
      )}

      {/* Solve result notice */}
      {solveNotice && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2">
          <div className="pointer-events-auto shadow-xl">
            <AppAlert
              tone={solveNotice.tone}
              title={solveNotice.title}
              description={solveNotice.description}
              onClose={() => setSolveNotice(null)}
            />
          </div>
        </div>
      )}

      {/* Undo delete toast */}
      {undoableDelete && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 w-[min(92vw,380px)]">
          <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
            <p className="text-xs font-semibold text-slate-800">
              Se eliminó &ldquo;{undoableDelete.item.name}&rdquo;
            </p>
            <button
              type="button"
              onClick={undoDelete}
              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              Deshacer
            </button>
          </div>
        </div>
      )}

      {/* Export Schedule Modal */}
      {showExportModal && data && (
        <ScheduleExportModal
          sections={selectedSectionObjects}
          courses={activeCourses}
          period={data.period}
          school={data.school}
          cycle={selectedCycle}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Save Schedule Modal */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 animate-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-modal-title"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl animate-modal-pop"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="save-modal-title" className="text-sm font-bold text-slate-900">
              Guardar horario
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Dale un nombre para identificarlo en tu lista de guardados.
            </p>
            <input
              type="text"
              value={scheduleName}
              onChange={(event) => setScheduleName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  confirmSave();
                }
              }}
              autoFocus
              placeholder="Nombre del horario"
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmSave}
                className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help panel */}
      {showHelp && (
        <div
          className="fixed right-4 top-16 z-[70] w-[min(92vw,360px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-drawer-slide"
          role="dialog"
          aria-label="Ayuda de MiHorario"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Cómo funciona
            </h3>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              <span className="font-bold text-slate-800">1.</span> Carga tu PDF de
              Programación de Asignaturas de UNMSM.
            </p>
            <p>
              <span className="font-bold text-slate-800">2.</span> Filtra por ciclo y elige una
              sección por curso.
            </p>
            <p>
              <span className="font-bold text-slate-800">3.</span> Pulsa{" "}
              <span className="font-semibold text-emerald-700">Generar Horarios Sin Cruces</span>{" "}
              para obtener combinaciones válidas y elige la que prefieras.
            </p>
            <p>
              Un <span className="font-bold text-rose-700">cruce</span> es cuando dos cursos
              seleccionados coinciden en el mismo día y hora.
            </p>
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px]">
              Tu PDF y tus horarios se procesan y guardan <span className="font-bold">solo en tu navegador</span>.
              No se suben a ningún servidor.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}


