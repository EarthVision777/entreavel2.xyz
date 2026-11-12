export type GuideSection = {
  title: string;
  paragraphs: string[];
};

export type GuidePractice = {
  title: string;
  steps: string[];
};

export type LessonGuide = {
  lead: string;
  sections: GuideSection[];
  practice?: GuidePractice;
  reflection: string;
  care: string;
};

export type ModuleNote = {
  summary: string;
  howToUse: string;
};
