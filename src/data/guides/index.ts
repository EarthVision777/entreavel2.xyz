import { lessonsA } from "./lessons-a";
import { lessonsB } from "./lessons-b";
import { lessonsC } from "./lessons-c";
import { moduleNotes } from "./modules";
import type { LessonGuide, ModuleNote } from "./types";

export const lessonGuides: Record<string, LessonGuide> = {
  ...lessonsA,
  ...lessonsB,
  ...lessonsC,
};

export function guideFor(id: string) {
  return lessonGuides[id] ?? null;
}

export { moduleNotes };

export function noteFor(id: string): ModuleNote | null {
  return moduleNotes[id as keyof typeof moduleNotes] ?? null;
}
export type { LessonGuide, ModuleNote, GuideSection, GuidePractice } from "./types";
