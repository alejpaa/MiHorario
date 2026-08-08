export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
}

export function normalizeDay(day: string): string {
  return day
    .normalize("NFD")
    .replace(/[^\w\s]/g, "")
    .toUpperCase();
}

export function formatTeacherName(rawTeacher?: string | null): string {
  if (!rawTeacher) return "Sin docente";
  const clean = rawTeacher
    .replace(/^\s*[0-9A-Z]+\s*-\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean || clean.toLowerCase() === "no asignado" || clean === "--") {
    return "Sin docente";
  }
  return clean;
}

