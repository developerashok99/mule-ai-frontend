"use client";

import { useMemo, useState } from "react";
import type { JobWithCompany } from "@/lib/types";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", INR: "₹" };

function formatSalary(job: JobWithCompany): string | null {
  if (!job.salary_min || !job.salary_max) return null;
  const symbol = CURRENCY_SYMBOLS[job.salary_currency ?? ""] ?? "";

  if (job.salary_currency === "INR") {
    // Indian job postings conventionally state pay in Lakhs (1L = 100,000)
    const lo = (job.salary_min / 100_000).toFixed(1).replace(/\.0$/, "");
    const hi = (job.salary_max / 100_000).toFixed(1).replace(/\.0$/, "");
    return `${symbol}${lo}L - ${symbol}${hi}L`;
  }

  const lo = Math.round(job.salary_min / 1000);
  const hi = Math.round(job.salary_max / 1000);
  return `${symbol}${lo}K - ${symbol}${hi}K`;
}

function scoreColor(score?: number) {
  if (score === undefined) return "text-neutral-400";
  if (score >= 7) return "text-green-600 dark:text-green-400";
  if (score >= 4) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

type SortMode = "date" | "salary";

export default function JobsList({ jobs }: { jobs: JobWithCompany[] }) {
  const [onlyWithSalary, setOnlyWithSalary] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("date");

  const visible = useMemo(() => {
    let list = jobs;
    if (onlyWithSalary) {
      list = list.filter((j) => j.salary_min && j.salary_max);
    }
    if (sortMode === "salary") {
      list = [...list].sort((a, b) => (b.salary_max ?? 0) - (a.salary_max ?? 0));
    }
    return list;
  }, [jobs, onlyWithSalary, sortMode]);

  const salaryCount = jobs.filter((j) => j.salary_min && j.salary_max).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyWithSalary}
            onChange={(e) => setOnlyWithSalary(e.target.checked)}
          />
          Only show jobs with salary listed ({salaryCount})
        </label>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-neutral-500">Sort:</span>
          <button
            onClick={() => setSortMode("date")}
            className={`px-2 py-1 rounded-md border ${sortMode === "date" ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-300 dark:border-neutral-700 text-neutral-500"}`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortMode("salary")}
            className={`px-2 py-1 rounded-md border ${sortMode === "salary" ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-300 dark:border-neutral-700 text-neutral-500"}`}
          >
            Salary
          </button>
        </div>
      </div>
      {sortMode === "salary" && (
        <p className="text-xs text-neutral-400">
          Sorted numerically by upper bound — currencies aren&apos;t converted, so this
          only ranks fairly within the same currency.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-neutral-500">No jobs match this filter.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((job) => {
            const salary = formatSalary(job);
            return (
              <div
                key={job._id}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline"
                    >
                      {job.title}
                    </a>
                    <div className="text-sm text-neutral-500">
                      {job.company} · {job.location || "location n/a"} · via {job.source}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {job.company_score !== undefined && (
                      <div className={`text-sm font-semibold ${scoreColor(job.company_score)}`}>
                        {job.company_score}/10
                      </div>
                    )}
                    {salary && (
                      <div
                        className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        title={job.salary_text}
                      >
                        {salary}
                      </div>
                    )}
                  </div>
                </div>
                {job.company_verdict && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    {job.company_verdict}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
