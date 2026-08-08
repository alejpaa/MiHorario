"use client";

interface AppAlertProps {
  title: string;
  description?: string;
  items?: string[];
  tone?: "warning" | "error" | "info" | "success";
  onClose?: () => void;
}

const toneClasses: Record<NonNullable<AppAlertProps["tone"]>, string> = {
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  error: "border-rose-300 bg-rose-50 text-rose-900",
  info: "border-sky-300 bg-sky-50 text-sky-900",
  success: "border-emerald-300 bg-emerald-50 text-emerald-900",
};

export function AppAlert({
  title,
  description,
  items = [],
  tone = "info",
  onClose,
}: AppAlertProps) {
  return (
    <section className={`rounded-xl border p-3 shadow-lg backdrop-blur animate-alert-slide ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description && <p className="mt-1 text-xs opacity-90">{description}</p>}
          {items.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {items.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-current/30 px-2 py-1 text-[11px] font-medium hover:bg-white/50"
          >
            Cerrar
          </button>
        )}
      </div>
    </section>
  );
}
