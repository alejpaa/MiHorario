import type { ParsedScheduleData } from "../types";

export const SAMPLE_UNMSM_DATA: ParsedScheduleData = {
  faculty: "FACULTAD DE INGENIERÍA DE SISTEMAS E INFORMÁTICA",
  school: "EP INGENIERÍA DE SOFTWARE (UNMSM)",
  period: "2026-1",
  cycles: [5, 6, 7, 8],
  courses: [
    // CICLO 7
    {
      code: "202SW0701",
      name: "ARQUITECTURA DE SOFTWARE",
      credits: 4,
      cycle: 7,
      sections: [
        {
          id: "202SW0701-1",
          sectionNumber: "1",
          teacher: "CORONEL CASTILLO, ERIC GUSTAVO",
          capacity: 40,
          enrolled: 35,
          timeSlots: [
            { day: "LUNES", start: "08:00", end: "11:00" },
            { day: "MIERCOLES", start: "08:00", end: "10:00" },
          ],
        },
        {
          id: "202SW0701-2",
          sectionNumber: "2",
          teacher: "VALLEJOS ALONSO, HENRY MARKT",
          capacity: 40,
          enrolled: 38,
          timeSlots: [
            { day: "MARTES", start: "14:00", end: "17:00" },
            { day: "JUEVES", start: "14:00", end: "16:00" },
          ],
        },
      ],
    },
    {
      code: "202SW0702",
      name: "GESTIÓN DE PROYECTOS DE SOFTWARE",
      credits: 4,
      cycle: 7,
      sections: [
        {
          id: "202SW0702-1",
          sectionNumber: "1",
          teacher: "MOQUEZUMA MORENO, CARLOS AULER",
          capacity: 35,
          enrolled: 32,
          timeSlots: [
            { day: "LUNES", start: "11:00", end: "14:00" },
            { day: "MIERCOLES", start: "10:00", end: "12:00" },
          ],
        },
        {
          id: "202SW0702-2",
          sectionNumber: "2",
          teacher: "CHÁVEZ ESPINOZA, MARIO ORLANDO",
          capacity: 35,
          enrolled: 30,
          timeSlots: [
            { day: "MARTES", start: "08:00", end: "11:00" },
            { day: "JUEVES", start: "08:00", end: "10:00" },
          ],
        },
      ],
    },
    {
      code: "202SW0703",
      name: "CALIDAD DE SOFTWARE",
      credits: 3,
      cycle: 7,
      sections: [
        {
          id: "202SW0703-1",
          sectionNumber: "1",
          teacher: "ZAPATA RAGAS, JOSE ALBERTO",
          capacity: 40,
          enrolled: 36,
          timeSlots: [
            { day: "MARTES", start: "11:00", end: "14:00" },
            { day: "VIERNES", start: "08:00", end: "10:00" },
          ],
        },
        {
          id: "202SW0703-2",
          sectionNumber: "2",
          teacher: "RÍOS LÓPEZ, JOSÉ LUIS",
          capacity: 40,
          enrolled: 39,
          timeSlots: [
            { day: "MIERCOLES", start: "14:00", end: "17:00" },
            { day: "VIERNES", start: "14:00", end: "16:00" },
          ],
        },
      ],
    },
    {
      code: "202SW0704",
      name: "INTELIGENCIA ARTIFICIAL",
      credits: 4,
      cycle: 7,
      sections: [
        {
          id: "202SW0704-1",
          sectionNumber: "1",
          teacher: "BENDEZÚ PÉREZ, EDDY JAVIER",
          capacity: 30,
          enrolled: 28,
          timeSlots: [
            { day: "JUEVES", start: "10:00", end: "13:00" },
            { day: "SABADO", start: "08:00", end: "11:00" },
          ],
        },
        {
          id: "202SW0704-2",
          sectionNumber: "2",
          teacher: "VARGAS VIZCARRA, GABRIEL LUIS",
          capacity: 30,
          enrolled: 29,
          timeSlots: [
            { day: "MIERCOLES", start: "17:00", end: "20:00" },
            { day: "VIERNES", start: "16:00", end: "18:00" },
          ],
        },
      ],
    },
    {
      code: "202SW0705",
      name: "SEMINARIO DE TESIS I",
      credits: 3,
      cycle: 7,
      sections: [
        {
          id: "202SW0705-1",
          sectionNumber: "1",
          teacher: "CÁRDENAS MANRIQUE, ROBERTO",
          capacity: 25,
          enrolled: 24,
          timeSlots: [
            { day: "VIERNES", start: "10:00", end: "13:00" },
          ],
        },
        {
          id: "202SW0705-2",
          sectionNumber: "2",
          teacher: "GUZMÁN VALLE, HUGO LORENZO",
          capacity: 25,
          enrolled: 22,
          timeSlots: [
            { day: "SABADO", start: "11:00", end: "14:00" },
          ],
        },
      ],
    },
    // CICLO 6 (Para pruebas de extraciclo)
    {
      code: "202SW0601",
      name: "BASE DE DATOS II",
      credits: 4,
      cycle: 6,
      sections: [
        {
          id: "202SW0601-1",
          sectionNumber: "1",
          teacher: "MENESES CLAUDIO, RONALD LUIS",
          capacity: 35,
          enrolled: 30,
          timeSlots: [
            { day: "LUNES", start: "14:00", end: "17:00" },
            { day: "JUEVES", start: "16:00", end: "18:00" },
          ],
        },
      ],
    },
    {
      code: "202SW0801",
      name: "DEVOPS Y CLOUD COMPUTING",
      credits: 3,
      cycle: 8,
      sections: [
        {
          id: "202SW0801-1",
          sectionNumber: "1",
          teacher: "ALARCÓN MATUTTI, LUIS FERNANDO",
          capacity: 35,
          enrolled: 25,
          timeSlots: [
            { day: "MARTES", start: "17:00", end: "20:00" },
          ],
        },
      ],
    },
  ],
};
