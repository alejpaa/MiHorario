"use client";

import { useRef, useState } from "react";

interface PDFUploaderProps {
  onFileSelected: (file: File) => void;
  loading: boolean;
  compact?: boolean;
  onLoadSample?: () => void;
}

export function PDFUploader({
  onFileSelected,
  loading,
  compact = false,
  onLoadSample,
}: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File | null | undefined) => {
    if (!file) {
      return;
    }
    if (file.type !== "application/pdf") {
      return;
    }
    onFileSelected(file);
  };

  if (compact) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
              1
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              PDF de Horarios
            </h2>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
          >
            {loading ? "Procesando..." : "Subir nuevo PDF"}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => processFile(event.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-2xs">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <h2 className="mt-4 text-xl font-extrabold text-slate-900 md:text-2xl">
          Carga tu reporte oficial de UNMSM
        </h2>
        <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed">
          Arrastra tu PDF de <span className="font-bold text-emerald-700">Programación de Asignaturas</span> (FISI / UNMSM). Extraeremos automáticamente todos los cursos, docentes, ciclos y secciones.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            processFile(event.dataTransfer.files[0]);
          }}
          disabled={loading}
          className={`mt-6 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-200 ${
            isDragging
              ? "border-emerald-500 bg-emerald-50 text-emerald-950 scale-[1.01]"
              : "border-slate-300 bg-slate-50/80 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/30"
          }`}

        >
          {loading ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Analizando PDF de UNMSM...</span>
            </div>
          ) : (
            <>
              <span className="text-sm font-bold text-slate-800">
                Haz clic para seleccionar o arrastra el archivo aquí
              </span>
              <span className="mt-1 font-mono text-xs text-slate-500">
                Formato PDF compatible (San Marcos)
              </span>
            </>
          )}
        </button>

        {onLoadSample && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>¿No tienes un PDF a la mano?</span>
            <button
              type="button"
              onClick={onLoadSample}
              className="rounded-lg bg-emerald-50 px-3 py-1.5 font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              Probar Demo UNMSM (FISI)
            </button>
          </div>
        )}
      </div>


      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => processFile(event.target.files?.[0])}
      />
    </section>
  );
}

