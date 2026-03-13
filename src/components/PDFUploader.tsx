"use client";

import { useRef, useState } from "react";

interface PDFUploaderProps {
  onFileSelected: (file: File) => void;
  loading: boolean;
  compact?: boolean;
}

export function PDFUploader({ onFileSelected, loading, compact = false }: PDFUploaderProps) {
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

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-800">
        {compact ? "Cambiar PDF" : "1) Sube tu PDF"}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {compact
          ? "Si ya cargaste cursos, solo sube de nuevo cuando cambie el periodo."
          : "Usa el reporte de Programacion de Asignaturas de tu universidad."}
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
        className={`mt-4 flex w-full items-center justify-center rounded-xl border-2 border-dashed px-4 ${compact ? "py-4" : "py-8"} text-sm transition ${
          isDragging
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-slate-300 bg-slate-50 text-slate-700 hover:border-emerald-400"
        }`}
        disabled={loading}
      >
        {loading
          ? "Procesando PDF..."
          : compact
            ? "Subir otro PDF"
            : "Arrastra el PDF o haz clic para elegir"}
      </button>

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
