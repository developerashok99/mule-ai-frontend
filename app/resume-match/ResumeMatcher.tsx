"use client";

import { useEffect, useMemo, useState } from "react";
import type { Job } from "@/lib/types";
import { SKILLS } from "@/lib/skills";

const STORAGE_KEY = "resume-text";

function skillsIn(text: string): string[] {
  const haystack = text.toLowerCase();
  return SKILLS.filter((skill) => haystack.includes(skill.toLowerCase()));
}

export default function ResumeMatcher({ jobs }: { jobs: Job[] }) {
  const [resume, setResume] = useState("");
  const [jobId, setJobId] = useState<string>(jobs[0]?._id ?? "");
  const [customJd, setCustomJd] = useState("");
  const [useCustom, setUseCustom] = useState(jobs.length === 0);

  useEffect(() => {
    setResume(localStorage.getItem(STORAGE_KEY) ?? "");
  }, []);

  function updateResume(value: string) {
    setResume(value);
    localStorage.setItem(STORAGE_KEY, value);
  }

  const jdText = useCustom ? customJd : (jobs.find((j) => j._id === jobId)?.description ?? "");
  const selectedJob = jobs.find((j) => j._id === jobId);

  const { missing, matched } = useMemo(() => {
    const inJd = skillsIn(jdText);
    const inResume = new Set(skillsIn(resume));
    return {
      matched: inJd.filter((s) => inResume.has(s)),
      missing: inJd.filter((s) => !inResume.has(s)),
    };
  }, [jdText, resume]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Your resume</label>
        <textarea
          value={resume}
          onChange={(e) => updateResume(e.target.value)}
          placeholder="Paste your resume text here..."
          rows={16}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium block mb-1">Job description</label>
          {jobs.length > 0 && (
            <div className="flex gap-2 mb-2 text-xs">
              <button
                onClick={() => setUseCustom(false)}
                className={`px-2 py-1 rounded-full border ${!useCustom ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-300 dark:border-neutral-700 text-neutral-500"}`}
              >
                Tracked job
              </button>
              <button
                onClick={() => setUseCustom(true)}
                className={`px-2 py-1 rounded-full border ${useCustom ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-300 dark:border-neutral-700 text-neutral-500"}`}
              >
                Paste custom JD
              </button>
            </div>
          )}
          {!useCustom ? (
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.company} — {j.title}
                </option>
              ))}
            </select>
          ) : (
            <textarea
              value={customJd}
              onChange={(e) => setCustomJd(e.target.value)}
              placeholder="Paste a job description..."
              rows={4}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          )}
          {selectedJob && !useCustom && (
            <a href={selectedJob.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 mt-1 inline-block">
              View posting →
            </a>
          )}
        </div>

        {jdText && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <div>
              <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                Missing ({missing.length})
              </div>
              {missing.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  {matched.length === 0 ? "No taxonomy skills detected in this JD." : "Nothing missing — good coverage."}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {matched.length > 0 && (
              <div>
                <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                  Already covered ({matched.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matched.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
