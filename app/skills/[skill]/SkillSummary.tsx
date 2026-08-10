"use client";

import { useCallback, useEffect, useState } from "react";

export default function SkillSummary({ skill, excerpts }: { skill: string; excerpts: string[] }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/skill-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, excerpts }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load summary");
      setSummary(data.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill]);

  useEffect(() => {
    load();
  }, [load]);

  if (excerpts.length === 0) {
    return null; // nothing to summarize without at least one real JD excerpt
  }

  const isDailyQuota = error?.toLowerCase().includes("tokens per day");
  const isRateLimit = !isDailyQuota && (error?.toLowerCase().includes("rate") || error?.toLowerCase().includes("429"));

  let friendlyError = error;
  if (isDailyQuota) friendlyError = "Groq's free daily quota is used up for today - this'll work again once it resets.";
  else if (isRateLimit) friendlyError = "Groq is rate-limited right now - try again in a moment.";

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">What employers expect</div>
      {loading && <p className="text-sm text-neutral-500">Summarizing across {excerpts.length} JD mentions...</p>}
      {error && (
        <div className="text-sm space-y-1">
          <p className="text-red-600 dark:text-red-400">{friendlyError}</p>
          {!isDailyQuota && (
            <button onClick={load} className="text-blue-600 dark:text-blue-400 hover:underline">
              Retry
            </button>
          )}
        </div>
      )}
      {summary && <p className="text-sm">{summary}</p>}
    </div>
  );
}
