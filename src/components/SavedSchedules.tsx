"use client";

import type { SavedSchedule } from "../types";

interface SavedSchedulesProps {
  items: SavedSchedule[];
  onLoad: (item: SavedSchedule) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

export function SavedSchedules({ items, onLoad, onDelete, onClose }: SavedSchedulesProps) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-drawer-slide">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
            ★
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Horarios Guardados ({items.length})
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Ciclo {item.selectedCycle} · {new Date(item.createdAt).toLocaleDateString("es-PE")}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onLoad(item);
                  onClose?.();
                }}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
              >
                Cargar Horario
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 transition"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
            Aún no has guardado combinaciones de horarios.
          </div>
        )}
      </div>
    </div>
  );
}


