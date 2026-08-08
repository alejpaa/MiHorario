"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface DropdownMenuProps {
  label: string;
  align?: "left" | "right";
  trigger: ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  children: (close: () => void) => ReactNode;
}

export function DropdownMenu({
  label,
  align = "left",
  trigger,
  triggerClassName,
  panelClassName,
  children,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          className={`absolute top-full z-40 mt-1.5 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1 shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName ?? ""}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
