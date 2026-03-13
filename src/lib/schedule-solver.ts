import type { Course, Section } from "../types";
import { sectionsHaveConflict } from "./conflict-checker";

function canUseSection(section: Section, selected: Section[]): boolean {
  for (const item of selected) {
    if (sectionsHaveConflict(item, section).length > 0) {
      return false;
    }
  }
  return true;
}

export function generateSchedules(
  courses: Course[],
  maxResults = 12,
): Record<string, string>[] {
  const results: Record<string, string>[] = [];

  function backtrack(
    courseIndex: number,
    currentSelection: Record<string, string>,
    selectedSections: Section[],
  ) {
    if (results.length >= maxResults) {
      return;
    }

    if (courseIndex >= courses.length) {
      results.push({ ...currentSelection });
      return;
    }

    const course = courses[courseIndex];

    for (const section of course.sections) {
      if (!canUseSection(section, selectedSections)) {
        continue;
      }

      currentSelection[course.code] = section.id;
      selectedSections.push(section);

      backtrack(courseIndex + 1, currentSelection, selectedSections);

      selectedSections.pop();
      delete currentSelection[course.code];
    }
  }

  backtrack(0, {}, []);
  return results;
}
