export interface LectureQA {
  _id: string; // chapter file name
  sha: string;
  questions_markdown: string;
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
