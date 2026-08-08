import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { Course, DayName, ParsedScheduleData, TimeSlot } from "../types";

const COURSE_START_REGEX = /^([0-9A-Z]{6,10})\s*-\s*/;

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

function getHeaderValue(rawLines: string[], label: string): string | undefined {
  const regex = new RegExp(`^${label}\\s*:\\s*(.+)$`, "i");
  const line = rawLines.find((item) => regex.test(item));
  if (!line) {
    return undefined;
  }

  const match = line.match(regex);
  return match?.[1]?.trim();
}

export async function parseUniversityPdf(file: File): Promise<ParsedScheduleData> {
  const rawLines = await extractPdfLines(file);
  const lines = rawLines.filter((line) => !isNoiseLine(line));
  const period = getHeaderValue(rawLines, "Periodo Acad[ée]mico");
  const faculty = getHeaderValue(rawLines, "Facultad");
  const school = getHeaderValue(rawLines, "Escuela");

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

    if (COURSE_START_REGEX.test(line)) {
      if (currentCycle === 0) {
        i += 1;
        continue;
      }

      const sectionLines = [lines[i]];
      i += 1;

      while (
        i < lines.length &&
        !/^CICLO\s+\d+$/.test(lines[i]) &&
        !COURSE_START_REGEX.test(lines[i])
      ) {
        sectionLines.push(lines[i]);
        i += 1;
      }

      const blockStr = sectionLines.join(" ").replace(/\s+/g, " ").trim();

      const match = blockStr.match(
        /^([0-9A-Z]{6,10})\s*-\s*(.+?)\s+(\d+(?:\.\d+)?)\s+(\d+)\s+(.+)$/,
      );

      if (!match) {
        continue;
      }

      const code = match[1];
      const name = match[2].trim();
      const credits = Number(match[3]);
      const sectionNumber = match[4];
      const rest = match[5];

      const slotRegex =
        /--\s*(LUNES|MARTES|MIERCOLES|MIÉRCOLES|JUEVES|VIERNES|SABADO|SÁBADO)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/gi;
      const timeSlots: TimeSlot[] = [];
      let slotMatch: RegExpExecArray | null;

      while ((slotMatch = slotRegex.exec(rest)) !== null) {
        const rawDay = slotMatch[1]
          .normalize("NFD")
          .replace(/[^\w\s]/g, "")
          .toUpperCase() as DayName;

        if (
          rawDay === "LUNES" ||
          rawDay === "MARTES" ||
          rawDay === "MIERCOLES" ||
          rawDay === "JUEVES" ||
          rawDay === "VIERNES" ||
          rawDay === "SABADO"
        ) {
          timeSlots.push({
            day: rawDay,
            start: slotMatch[2],
            end: slotMatch[3],
          });
        }
      }

      const firstSlotIndex = rest.search(
        /--\s*(LUNES|MARTES|MIERCOLES|MIÉRCOLES|JUEVES|VIERNES|SABADO|SÁBADO)/i,
      );
      const metaPart =
        firstSlotIndex !== -1 ? rest.slice(0, firstSlotIndex).trim() : rest;

      const metaMatch =
        metaPart.match(/^(.*?)\s+(\d+)\s+(\d+)(?:\s+--)?$/) ||
        metaPart.match(/^(.*)$/);

      let teacher = "No asignado";
      let capacity: number | undefined;
      let enrolled: number | undefined;

      if (metaMatch && metaMatch[2] !== undefined && metaMatch[3] !== undefined) {
        const rawTeacher = metaMatch[1].replace(/--/g, "").trim();
        teacher =
          !rawTeacher || rawTeacher === "No asignado" || rawTeacher === "--"
            ? "No asignado"
            : rawTeacher;
        capacity = Number(metaMatch[2]);
        enrolled = Number(metaMatch[3]);
      } else {
        const rawTeacher = metaPart.replace(/--/g, "").trim();
        teacher =
          !rawTeacher || rawTeacher === "No asignado" || rawTeacher === "--"
            ? "No asignado"
            : rawTeacher;
      }

      const course = getOrCreateCourse(
        courseMap,
        code,
        name,
        credits,
        currentCycle,
      );

      const sectionId = `${code}-${sectionNumber}`;
      if (!course.sections.some((item) => item.id === sectionId)) {
        course.sections.push({
          id: sectionId,
          sectionNumber,
          teacher,
          capacity,
          enrolled,
          timeSlots,
        });
      }
    } else {
      i += 1;
    }
  }

  const courses = Array.from(courseMap.values()).sort((a, b) =>
    a.code.localeCompare(b.code),
  );

  return {
    courses,
    cycles: Array.from(cycles).sort((a, b) => a - b),
    period,
    faculty,
    school,
  };
}
