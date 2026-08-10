import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import type { Company, JdReport, Job, LectureQA } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getToday() {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [newJobs, scoredCompanies, generatedChapters, closedJobs, latestReport] = await Promise.all([
    db.collection<Job>("jobs").find({ first_seen_date: today }).toArray(),
    db.collection<Company>("companies").find({ scored_date: today }).toArray(),
    db.collection<LectureQA>("lecture_qna").find({ generated_date: today }, { projection: { _id: 1 } }).toArray(),
    db.collection<Job>("jobs").find({ closed_date: today }).toArray(),
    db.collection<JdReport>("jd_reports").find({}).sort({ _id: -1 }).limit(1).toArray(),
  ]);

  return { today, newJobs, scoredCompanies, generatedChapters, closedJobs, latestReport: latestReport[0] };
}

function scoreColor(score: number) {
  if (score >= 7) return "text-green-600 dark:text-green-400";
  if (score >= 4) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export default async function TodayPage() {
  const { today, newJobs, scoredCompanies, generatedChapters, closedJobs, latestReport } = await getToday();
  const nothingYet = newJobs.length === 0 && scoredCompanies.length === 0 && generatedChapters.length === 0 && closedJobs.length === 0;
  const topSkills = latestReport
    ? Object.entries(latestReport.counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Today</h1>
        <p className="text-sm text-neutral-500">
          What the pipeline found on its runs today ({today}) — the same content as the Telegram digest, for
          when you'd rather check here.
        </p>
      </div>

      {nothingYet && (
        <p className="text-sm text-neutral-500">
          Nothing new yet today — the pipeline runs 3x/day, check back after the next scheduled run
          (~9am / 2pm / 8pm IST), or trigger it manually from the pipeline repo&apos;s Actions tab.
        </p>
      )}

      {newJobs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">
            {newJobs.length} new job{newJobs.length === 1 ? "" : "s"}
          </h2>
          <div className="space-y-2">
            {newJobs.map((j) => (
              <div key={j._id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
                <a href={j.url} target="_blank" rel="noreferrer" className="font-medium text-sm hover:underline">
                  {j.title}
                </a>
                <div className="text-xs text-neutral-500">{j.company} · {j.location || "location n/a"} · via {j.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scoredCompanies.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">
            {scoredCompanies.length} compan{scoredCompanies.length === 1 ? "y" : "ies"} scored
          </h2>
          <div className="space-y-2">
            {scoredCompanies.map((c) => (
              <div key={c._id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="flex justify-between items-start gap-3">
                  <span className="font-medium text-sm">{c._id}</span>
                  <span className={`text-sm font-semibold shrink-0 ${scoreColor(c.score)}`}>{c.score}/10</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{c.verdict}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatedChapters.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">
            {generatedChapters.length} chapter{generatedChapters.length === 1 ? "" : "s"} got new Q&amp;A
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {generatedChapters.map((c) => (
              <Link
                key={c._id}
                href="/lectures"
                className="text-xs px-2 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-neutral-500"
              >
                {c._id.replace(/\.md$/, "")}
              </Link>
            ))}
          </div>
        </div>
      )}

      {closedJobs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">
            {closedJobs.length} posting{closedJobs.length === 1 ? "" : "s"} closed (dead link)
          </h2>
          <div className="flex flex-wrap gap-1.5 text-xs text-neutral-500">
            {closedJobs.map((j) => (
              <span key={j._id} className="px-2 py-1 rounded-full border border-neutral-200 dark:border-neutral-800">
                {j.company} — {j.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {topSkills.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Top skills across all tracked JDs</h2>
          <ul className="text-sm space-y-1">
            {topSkills.map(([skill, count]) => (
              <li key={skill} className="flex justify-between border-b border-neutral-100 dark:border-neutral-900 py-1">
                <span>{skill}</span>
                <span className="text-neutral-500">{count} mentions</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
