"use client";

import { useEffect, useMemo, useState } from "react";
import { AppAlert } from "../components/AppAlert";
import { CourseList, type ConflictSelectionNotice } from "../components/CourseList";
import { CycleSelector } from "../components/CycleSelector";
import { PDFUploader } from "../components/PDFUploader";
import { SavedSchedules } from "../components/SavedSchedules";
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

function getSectionById(courses: Course[], sectionId: string): Section | undefined {
  for (const course of courses) {
    const found = course.sections.find((section) => section.id === sectionId);
    if (found) {
      return found;
    }
  }
  return undefined;
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
  const [showSavedModal, setShowSavedModal] = useState(false);

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
    if (options[0]) {
      setSelectedSections(options[0]);
    }
  };

  const loadAutoOption = (nextIndex: number) => {
    if (!autoOptions[nextIndex]) {
      return;
    }
    setAutoIndex(nextIndex);
    setSelectedSections(autoOptions[nextIndex]);
  };

  const saveCurrentSchedule = () => {
    const name = window.prompt("Nombre para este horario", `Horario UNMSM ${savedSchedules.length + 1}`);
    if (!name) {
      return;
    }

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
  };

  const loadSaved = (item: SavedSchedule) => {
    setSelectedCycle(item.selectedCycle);
    setAllowExtraCourses(item.extraCourseCodes.length > 0);
    setExtraCourseCodes(item.extraCourseCodes);
    setSelectedSections(item.selectedSections);
  };

  const deleteSaved = (id: string) => {
    const next = savedSchedules.filter((item) => item.id !== id);
    setSavedSchedules(next);
    saveSchedules(next);
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
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generar Horarios Sin Cruces</span>
                </button>

                <button
                  type="button"
                  onClick={saveCurrentSchedule}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition"
                >
                  ★ Guardar
                </button>
              </div>

              {/* Solver option selector */}
              {autoOptions.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 font-mono">
                  <button
                    type="button"
                    onClick={() => loadAutoOption(Math.max(0, autoIndex - 1))}
                    disabled={autoIndex === 0}
                    className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <span className="font-extrabold text-emerald-800">
                    Opción {autoIndex + 1} de {autoOptions.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => loadAutoOption(Math.min(autoOptions.length - 1, autoIndex + 1))}
                    disabled={autoIndex === autoOptions.length - 1}
                    className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
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
              description="Esta selección genera solapamiento de horario:"
              items={conflictNotice.conflicts.map(
                (item) => `${item.code} - ${item.name} (Sec ${item.sectionNumber})`,
              )}
              onClose={() => setConflictNotice(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}


