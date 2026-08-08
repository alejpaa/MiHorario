"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ScheduleGrid } from "./ScheduleGrid";
import type { Course, Section } from "../types";

const SITE_URL = "mihorario-unmsm.vercel.app";

interface ScheduleExportModalProps {
  sections: Section[];
  courses: Course[];
  period?: string;
  school?: string;
  cycle: number;
  onClose: () => void;
  onOpenSupport?: () => void;
}

type GenerationStatus = "generating" | "done" | "failed";
type CopyStatus = "idle" | "copied" | "failed";

export function ScheduleExportModal({
  sections,
  courses,
  period,
  school,
  cycle,
  onClose,
  onOpenSupport,
}: ScheduleExportModalProps) {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("generating");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      try {
        await document.fonts.ready;
        await new Promise((resolve) => setTimeout(resolve, 150));

        const node = captureRef.current;
        if (!node) {
          throw new Error("No se encontró el horario.");
        }

        const dataUrl = await toPng(node, {
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });

        if (cancelled) {
          return;
        }

        setPreview(dataUrl);

        const blob = await (await fetch(dataUrl)).blob();
        if (cancelled) {
          return;
        }

        setGenerationStatus("done");

        if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
          setCopyStatus("failed");
          return;
        }

        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopyStatus("copied");
        } catch {
          setCopyStatus("failed");
        }
      } catch {
        if (!cancelled) {
          setGenerationStatus("failed");
          setCopyStatus("failed");
        }
      }
    };

    generate();
    return () => {
      cancelled = true;
    };
  }, [courses, cycle, period, school, sections]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 animate-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-modal-pop"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 id="export-modal-title" className="text-sm font-bold text-slate-900">
              Exportar horario
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Imagen panorámica (16:9) lista para compartir en WhatsApp, Discord, Telegram…
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar exportación"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {generationStatus === "generating" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <p className="text-xs font-semibold">Generando imagen…</p>
            </div>
          )}

          {generationStatus === "failed" && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-900">
              No se pudo generar la imagen. Intenta de nuevo.
            </div>
          )}

          {generationStatus === "done" && preview && (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Vista previa del horario exportado"
                className="mx-auto max-h-[58vh] w-full object-contain rounded-xl border border-slate-200 shadow-sm"
              />

              {copyStatus === "copied" && (
                <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="text-emerald-600">✓</span>
                  Copiada al portapapeles. Solo pega donde quieras compartirla.
                </p>
              )}
              {copyStatus === "failed" && (
                <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                  No se pudo copiar automáticamente. Usa &ldquo;Descargar PNG&rdquo; y comparte el archivo.
                </p>
              )}

              {onOpenSupport && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-emerald-50 p-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-600 font-extrabold text-white text-xs shadow-2xs">
                      💜
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        ¿Te ayudó la herramienta?
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Puedes apoyar voluntariamente con Yape para mantener el proyecto.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenSupport}
                    className="shrink-0 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-2xs hover:bg-purple-700 transition"
                  >
                    Apoyar con Yape
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 px-5 py-3">
          {onOpenSupport ? (
            <button
              type="button"
              onClick={onOpenSupport}
              className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-extrabold text-purple-900 hover:bg-purple-100 transition"
            >
              <span>💜</span>
              <span>Yapear / Apoyar</span>
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cerrar
            </button>
            {generationStatus === "done" && preview && (
              <a
                href={preview}
                download="mi-horario.png"
                className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
              >
                Descargar PNG
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Hidden capture node: widescreen (16:9 aspect ratio) + brand header & footer */}
      <div className="pointer-events-none fixed left-0 top-0 -z-[9999] opacity-0" aria-hidden="true">
        <div ref={captureRef} className="w-[1440px] bg-white">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-7 py-4.5">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-black text-white text-base shadow-2xs">
                MH
              </span>
              <div>
                <p className="font-extrabold text-xl text-slate-900 tracking-tight">
                  MiHorario{" "}
                  <span className="font-mono text-emerald-700 text-sm font-bold">UNMSM</span>
                </p>
                <p className="font-mono text-xs text-slate-400">{SITE_URL}</p>
              </div>
            </div>
            <div className="text-right">
              {school && <p className="text-xs font-semibold text-slate-600">{school}</p>}
              <p className="text-sm font-bold text-slate-800">
                {period ? `${period} · Ciclo ${cycle}` : `Ciclo ${cycle}`}
              </p>
            </div>
          </header>

          <div className="bg-white p-6">
            <div className="h-[710px] w-full">
              <ScheduleGrid
                selectedSections={sections}
                courses={courses}
                interactive={false}
              />
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-7 py-3 text-xs text-slate-500">
            <div className="flex items-center gap-4 font-medium">
              <span>Asignaturas seleccionadas: <strong className="font-bold text-slate-800">{sections.length}</strong></span>
            </div>
            <p className="font-mono text-[11px] text-slate-400">
              Generado en {SITE_URL}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
