export interface Question {
  _id: string;
  chapter: string;
  question: string;
  level: string;
  answer: string;
}

export interface LectureQA {
  _id: string; // chapter file name
  sha: string;
  questions_markdown: string;
  questions?: Question[];
  cheat_sheet_markdown?: string;
}

export interface Job {
  _id: string; // dedupe key
  source: string;
  company: string;
  title: string;
  location: string;
  url: string;
  description: string;
  posted_date: string;
  first_seen_date: string;
  closed?: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_text?: string;
}

export interface JobWithCompany extends Job {
  company_score?: number;
  company_verdict?: string;
}

export interface Company {
  _id: string; // company name
  score: number;
  verdict: string;
  scored_date: string;
}

export interface JdReport {
  _id: string; // run date, YYYY-MM-DD
  counts: Record<string, number>;
}

export const APPLICATION_STATUSES = [
  "not_applied",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  _id: string; // same as job dedupe key
  company: string;
  title: string;
  url: string;
  status: ApplicationStatus;
  notes: string;
  updated_date: string;
}

export interface ChapterProgress {
  _id: string; // chapter name
  reviewed: boolean;
  reviewed_date: string;
}

export const REVIEW_STATUSES = ["missed", "shaky", "got_it"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface QuestionProgress {
  _id: string; // question id
  box: number; // 1-3, Leitner box
  status: ReviewStatus;
  last_reviewed: string;
  next_review: string; // ISO date, due when <= today
}

export interface DataWeaveProblem {
  _id: string;
  task: string;
  sample_input: unknown;
  expected_output: unknown;
  reference_solution: string;
  difficulty: "easy" | "medium" | "hard";
}
