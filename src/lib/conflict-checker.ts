import type { Conflict, DayName, Section } from "../types";
import { normalizeDay, overlaps } from "./time";

export function sectionsHaveConflict(a: Section, b: Section): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const slotA of a.timeSlots) {
    for (const slotB of b.timeSlots) {
      const dayA = normalizeDay(slotA.day) as DayName;
      const dayB = normalizeDay(slotB.day) as DayName;

      if (dayA !== dayB) {
        continue;
      }

      if (overlaps(slotA.start, slotA.end, slotB.start, slotB.end)) {
        conflicts.push({
          day: dayA,
          start: slotA.start > slotB.start ? slotA.start : slotB.start,
          end: slotA.end < slotB.end ? slotA.end : slotB.end,
          sectionAId: a.id,
          sectionBId: b.id,
        });
      }
    }
  }

  return conflicts;
}

export function getAllConflicts(sections: Section[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (let i = 0; i < sections.length; i += 1) {
    for (let j = i + 1; j < sections.length; j += 1) {
      conflicts.push(...sectionsHaveConflict(sections[i], sections[j]));
    }
  }

  return conflicts;
}
