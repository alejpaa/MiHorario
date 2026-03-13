"use client";

import type { SavedSchedule } from "../types";

interface SavedSchedulesProps {
  items: SavedSchedule[];
  onLoad: (item: SavedSchedule) => void;
  onDelete: (id: string) => void;
}

export function SavedSchedules({ items, onLoad, onDelete }: SavedSchedulesProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between">
        <p className="text-sm font-semibold text-slate-800">5) Horarios guardados</p>
        <p className="text-xs text-slate-500">{items.length}</p>
      </div>

      <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">{item.name}</p>
            <p className="text-xs text-slate-500">Ciclo {item.selectedCycle}</p>
            <p className="text-xs text-slate-500">
              {new Date(item.createdAt).toLocaleString("es-PE")}
            </p>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onLoad(item)}
                className="rounded-md bg-slate-800 px-3 py-1 text-xs text-white hover:bg-slate-700"
              >
                Cargar
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded-md border border-rose-300 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            Aun no guardaste horarios.
          </p>
        )}
      </div>
    </section>
  );
}
