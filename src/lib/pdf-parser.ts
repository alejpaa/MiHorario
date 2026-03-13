import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { Course, DayName, ParsedScheduleData, Section, TimeSlot } from "../types";
import { normalizeDay } from "./time";

const COURSE_CODE_REGEX = /^(\d{3}SW[0-9A-Z]{4})\s*-\s*(.+)$/;
const DAY_TIME_REGEX =
  /^--\s*(LUNES|MARTES|MIERCOLES|MI\u00c9RCOLES|JUEVES|VIERNES|SABADO|S\u00c1BADO)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/;

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") {
    return;
  }

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  workerConfigured = true;
}

function isNoiseLine(line: string): boolean {
  return (
    line.length === 0 ||
    line.startsWith("Documento Verificable") ||
    line.startsWith("Escanee este") ||
    line.startsWith("REPORTE DE PROGRAMACI") ||
    line.startsWith("Sistema \u00danico") ||
    line.startsWith("Asignatura") ||
    line.startsWith("Cr\u00e9d.") ||
    line.startsWith("Sec.") ||
    line.startsWith("Docente") ||
    line.startsWith("Tope") ||
    line.startsWith("Matri.") ||
    line.startsWith("Aula") ||
    line.startsWith("D\u00eda") ||
    line.startsWith("Horas Clase") ||
    /^P\u00e1gina\s+\d+/i.test(line)
  );
}

function parseSectionTimeSlots(lines: string[], startIndex: number) {
  const timeSlots: TimeSlot[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];
    const dayMatch = line.match(DAY_TIME_REGEX);

    if (!dayMatch) {
      break;
    }

    const day = normalizeDay(dayMatch[1]) as DayName;
    const start = dayMatch[2];
    const end = dayMatch[3];

    if (
      day === "LUNES" ||
      day === "MARTES" ||
      day === "MIERCOLES" ||
      day === "JUEVES" ||
      day === "VIERNES" ||
      day === "SABADO"
    ) {
      timeSlots.push({ day, start, end });
    }

    i += 1;
  }

  return { timeSlots, nextIndex: i };
}

function parseInlineDaySlot(line: string): TimeSlot | null {
  const dayMatch = line.match(DAY_TIME_REGEX);
  if (!dayMatch) {
    return null;
  }

  const day = normalizeDay(dayMatch[1]) as DayName;
  if (
    day !== "LUNES" &&
    day !== "MARTES" &&
    day !== "MIERCOLES" &&
    day !== "JUEVES" &&
    day !== "VIERNES" &&
    day !== "SABADO"
  ) {
    return null;
  }

  return {
    day,
    start: dayMatch[2],
    end: dayMatch[3],
  };
}

function parseTeacherCapacityAndFirstSlot(
  initial: string,
  lines: string[],
  index: number,
): {
  teacher: string;
  capacity?: number;
  enrolled?: number;
  firstSlot?: TimeSlot;
  consumedLines: number;
} {
  const MAX_EXTRA_LINES = 2;
  let consumedLines = 0;
  let merged = initial.trim();

  while (consumedLines <= MAX_EXTRA_LINES) {
    const match = merged.match(
      /^(.*?)\s+(\d+)\s+(\d+)\s+--\s*(LUNES|MARTES|MIERCOLES|MIÉRCOLES|JUEVES|VIERNES|SABADO|SÁBADO)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/,
    );

    if (match) {
      const teacher = match[1].replace(/\s+/g, " ").trim();
      const day = normalizeDay(match[4]) as DayName;
      const firstSlot: TimeSlot = {
        day,
        start: match[5],
        end: match[6],
      };

      return {
        teacher,
        capacity: Number(match[2]),
        enrolled: Number(match[3]),
        firstSlot,
        consumedLines,
      };
    }

    if (consumedLines >= MAX_EXTRA_LINES || !lines[index + consumedLines + 1]) {
      break;
    }

    consumedLines += 1;
    merged = `${merged} ${lines[index + consumedLines]}`.replace(/\s+/g, " ").trim();
  }

  const fallback = merged.match(/^(.*?)\s+(\d+)\s+(\d+)$/);
  if (fallback) {
    return {
      teacher: fallback[1].replace(/\s+/g, " ").trim(),
      capacity: Number(fallback[2]),
      enrolled: Number(fallback[3]),
      consumedLines,
    };
  }

  return {
    teacher: initial.replace(/\s+/g, " ").trim() || "No asignado",
    consumedLines,
  };
}

async function extractPdfLines(file: File): Promise<string[]> {
  ensurePdfWorker();
  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({
    data,
  } as unknown as Parameters<typeof pdfjs.getDocument>[0]).promise;
  const lines: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const text = await page.getTextContent();

    let currentLine = "";
    for (const item of text.items as Array<{ str: string; hasEOL?: boolean }>) {
      currentLine += item.str;
      if (item.hasEOL) {
        const cleaned = currentLine.replace(/\s+/g, " ").trim();
        if (cleaned.length > 0) {
          lines.push(cleaned);
        }
        currentLine = "";
      }
    }

    const tail = currentLine.replace(/\s+/g, " ").trim();
    if (tail.length > 0) {
      lines.push(tail);
    }
  }

  return lines;
}

function getOrCreateCourse(
  map: Map<string, Course>,
  code: string,
  name: string,
  credits: number,
  cycle: number,
): Course {
  const existing = map.get(code);
  if (existing) {
    return existing;
  }

  const course: Course = {
    code,
    name,
    credits,
    cycle,
    sections: [],
  };
  map.set(code, course);
  return course;
}

export async function parseUniversityPdf(file: File): Promise<ParsedScheduleData> {
  const rawLines = await extractPdfLines(file);
  const lines = rawLines.filter((line) => !isNoiseLine(line));

  const courseMap = new Map<string, Course>();
  const cycles = new Set<number>();

  let currentCycle = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const cycleMatch = line.match(/^CICLO\s+(\d+)$/);
    if (cycleMatch) {
      currentCycle = Number(cycleMatch[1]);
      cycles.add(currentCycle);
      i += 1;
      continue;
    }

    const courseMatch = line.match(COURSE_CODE_REGEX);
    if (!courseMatch) {
      i += 1;
      continue;
    }

    if (currentCycle === 0) {
      i += 1;
      continue;
    }

    const code = courseMatch[1];
    const nameParts = [courseMatch[2]];
    i += 1;

    while (i < lines.length && !/^CICLO\s+\d+$/.test(lines[i])) {
      if (COURSE_CODE_REGEX.test(lines[i])) {
        break;
      }

      const current = lines[i];
      const metaMatch = current.match(/^(.*?)\s(\d+(?:\.\d+)?)\s+(\d+)\s+(.+)$/);

      if (!metaMatch) {
        nameParts.push(current);
        i += 1;
        continue;
      }

      const trailingName = metaMatch[1].trim();
      if (trailingName.length > 0) {
        const last = nameParts[nameParts.length - 1]?.trim();
        if (last !== trailingName) {
          nameParts.push(trailingName);
        }
      }

      const credits = Number(metaMatch[2]);
      const sectionNumber = metaMatch[3];
      const teacherAndMeta = metaMatch[4];

      const teacherMeta = parseTeacherCapacityAndFirstSlot(teacherAndMeta, lines, i);
      i += teacherMeta.consumedLines + 1;

      const timeSlots: TimeSlot[] = [];
      if (teacherMeta.firstSlot) {
        timeSlots.push(teacherMeta.firstSlot);
      }

      const slotInfo = parseSectionTimeSlots(lines, i);
      timeSlots.push(...slotInfo.timeSlots);
      i = slotInfo.nextIndex;

      const name = nameParts.join(" ").replace(/\s+/g, " ").trim();
      const section: Section = {
        id: `${code}-${sectionNumber}`,
        sectionNumber,
        teacher:
          teacherMeta.teacher === "--" || teacherMeta.teacher.length === 0
            ? "No asignado"
            : teacherMeta.teacher,
        capacity: teacherMeta.capacity,
        enrolled: teacherMeta.enrolled,
        timeSlots,
      };

      const course = getOrCreateCourse(courseMap, code, name, credits, currentCycle);

      if (!course.sections.some((item) => item.id === section.id)) {
        course.sections.push(section);
      }

      const inlineDaySlot = parseInlineDaySlot(lines[i] ?? "");
      if (inlineDaySlot && !section.timeSlots.some((slot) => slot.start === inlineDaySlot.start && slot.end === inlineDaySlot.end && slot.day === inlineDaySlot.day)) {
        section.timeSlots.push(inlineDaySlot);
        i += 1;
      }
    }
  }

  const courses = Array.from(courseMap.values()).sort((a, b) =>
    a.code.localeCompare(b.code),
  );

  return {
    courses,
    cycles: Array.from(cycles).sort((a, b) => a - b),
  };
}
