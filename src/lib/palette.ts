export interface CoursePalette {
  bg: string;
  border: string;
  text: string;
  badge: string;
}

export const COURSE_PALETTES: CoursePalette[] = [
  { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-950", badge: "bg-emerald-200 text-emerald-900" },
  { bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-950", badge: "bg-sky-200 text-sky-900" },
  { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-950", badge: "bg-amber-200 text-amber-900" },
  { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-950", badge: "bg-indigo-200 text-indigo-900" },
  { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-950", badge: "bg-violet-200 text-violet-900" },
  { bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-950", badge: "bg-rose-200 text-rose-900" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-950", badge: "bg-teal-200 text-teal-900" },
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-950", badge: "bg-blue-200 text-blue-900" },
  { bg: "bg-fuchsia-100", border: "border-fuchsia-300", text: "text-fuchsia-950", badge: "bg-fuchsia-200 text-fuchsia-900" },
];

export function getCoursePalette(input: string): CoursePalette {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COURSE_PALETTES.length;
  return COURSE_PALETTES[index];
}
