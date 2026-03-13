"use client";

import { useEffect, useMemo, useState } from "react";
import { CourseList } from "../components/CourseList";
import { CycleSelector } from "../components/CycleSelector";
import { PDFUploader } from "../components/PDFUploader";
import { SavedSchedules } from "../components/SavedSchedules";
import { ScheduleGrid } from "../components/ScheduleGrid";
import { getAllConflicts } from "../lib/conflict-checker";
import { parseUniversityPdf } from "../lib/pdf-parser";
import { generateSchedules } from "../lib/schedule-solver";
import { loadSchedules, saveSchedules } from "../lib/storage";
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

  useEffect(() => {
    setSavedSchedules(loadSchedules());
  }, []);

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

  const selectSection = (courseCode: string, sectionId: string) => {
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
    const name = window.prompt("Nombre para este horario", `Horario ${savedSchedules.length + 1}`);
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

  const headerBadge = data?.school ?? "Planificador universitario";
  const headerDescription = data
    ? "Selecciona ciclo y secciones para construir tu horario ideal sin cruces."
    : "Sube tu PDF de programacion, arma horarios y guarda tus mejores opciones.";
  const hasData = Boolean(data);

  return (
    <main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#dcfce7_0,#eff6ff_40%,#f8fafc_100%)] p-3 md:p-5">
      <div className={`mx-auto flex h-full w-full flex-col ${hasData ? "max-w-[1700px]" : "max-w-6xl"}`}>
        <header
          className={`mb-4 rounded-2xl border border-slate-300 bg-white/90 p-4 shadow-sm backdrop-blur md:p-5 ${
            hasData ? "" : "mx-auto w-full max-w-5xl"
          }`}
        >
          <div className={hasData ? "" : "mx-auto max-w-3xl text-center"}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{headerBadge}</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Mi Horario</h1>
            <p className={`mt-2 text-sm text-slate-600 ${hasData ? "max-w-3xl" : ""}`}>{headerDescription}</p>

            {data && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                {data.faculty && <span className="rounded-full bg-slate-100 px-3 py-1">{data.faculty}</span>}
                {data.period && <span className="rounded-full bg-slate-100 px-3 py-1">Periodo {data.period}</span>}
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                  Cursos detectados: {data.courses.length}
                </span>
              </div>
            )}
          </div>
        </header>

        {!data ? (
          <div className="grid min-h-0 flex-1 place-items-center">
            <div className="w-full max-w-5xl space-y-4">
              {error && (
                <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
                <PDFUploader onFileSelected={parsePdf} loading={loadingPdf} />

                <section className="flex items-center rounded-2xl border border-slate-300 bg-white p-8 shadow-sm">
                  <div className="mx-auto max-w-md text-center">
                    <p className="text-lg font-semibold text-slate-800">Empieza subiendo tu reporte PDF</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Detectaremos ciclos, cursos y secciones para que armes tu horario manualmente o con generacion automatica.
                    </p>
                  </div>
                </section>
              </div>

              <div className="max-w-[420px]">
                <SavedSchedules items={savedSchedules} onLoad={loadSaved} onDelete={deleteSaved} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
            <aside className="order-2 min-h-0 space-y-4 overflow-hidden xl:order-1">
              <PDFUploader onFileSelected={parsePdf} loading={loadingPdf} compact />
              <SavedSchedules items={savedSchedules} onLoad={loadSaved} onDelete={deleteSaved} />
            </aside>

            <section className="order-1 min-h-0 space-y-4 overflow-hidden xl:order-2">
              <section className="flex flex-wrap gap-2 rounded-2xl border border-slate-300 bg-white p-3 shadow-sm">
                <button
                  type="button"
                  onClick={runAutoGeneration}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Generar horario automatico
                </button>
                <button
                  type="button"
                  onClick={saveCurrentSchedule}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Guardar horario actual
                </button>

                {autoOptions.length > 0 && (
                  <div className="ml-auto flex items-center gap-2 text-sm text-slate-700">
                    <button
                      type="button"
                      onClick={() => loadAutoOption(Math.max(0, autoIndex - 1))}
                      className="rounded-md border border-slate-300 px-2 py-1"
                    >
                      ←
                    </button>
                    <span>
                      Opcion {autoIndex + 1} / {autoOptions.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => loadAutoOption(Math.min(autoOptions.length - 1, autoIndex + 1))}
                      className="rounded-md border border-slate-300 px-2 py-1"
                    >
                      →
                    </button>
                  </div>
                )}
              </section>

              {conflicts.length > 0 && (
                <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Hay {conflicts.length} cruce(s) entre secciones seleccionadas.
                </p>
              )}

              <ScheduleGrid selectedSections={selectedSectionObjects} courses={activeCourses} />
            </section>

            <aside className="order-3 flex min-h-0 flex-col gap-4 overflow-hidden">
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

              <div className="min-h-0 flex-1">
                <CourseList
                  courses={activeCourses}
                  selectedSections={selectedSections}
                  onSelectSection={selectSection}
                  selectedSectionObjects={selectedSectionObjects}
                />
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
