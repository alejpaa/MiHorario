"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface SupportModalProps {
  onClose: () => void;
}

export function SupportModal({ onClose }: SupportModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-modal-pop"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-purple-50 via-white to-emerald-50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-600 font-extrabold text-white text-base shadow-sm">
              💜
            </span>
            <div>
              <h3 id="support-modal-title" className="text-sm font-extrabold text-slate-900">
                Apoyar el proyecto
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Voluntario · Yape (Perú)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar apoyo"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed text-center">
            <strong className="font-bold text-slate-800">MiHorario UNMSM</strong> es un proyecto 100% gratuito e independiente. Si te ahorró tiempo al armar tu horario, ¡tu apoyo voluntario ayuda mucho a mantener el servicio activo!
          </p>

          {/* QR Display Frame (Yape Oficial) */}
          <div className="relative mx-auto flex flex-col items-center justify-center rounded-3xl border border-purple-100 bg-purple-50/40 p-5 shadow-xs">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-md">
              <Image
                src="/yape-png.png"
                alt="Código QR Yape oficial para donaciones"
                width={240}
                height={240}
                className="h-56 w-56 object-contain rounded-lg"
                priority
              />
            </div>

            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 border border-purple-200 px-3 py-1 text-[11px] font-extrabold text-purple-900">
                <span>📱</span> Escanea y yapea desde tu app de Yape
              </span>
            </div>
          </div>

          {/* Extra Info / Advice */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center text-xs space-y-2">
            <p className="text-slate-500 text-[11px]">
              Escanea el código QR directamente desde la aplicación de Yape en tu celular.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <span className="text-[11px] font-semibold text-slate-400">
            ¡Muchas gracias por tu apoyo! ❤️
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
