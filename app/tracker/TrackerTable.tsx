"use client";

import { useState } from "react";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/types";

interface Row {
  _id: string;
  company: string;
  title: string;
  url: string;
  status: ApplicationStatus;
  notes: string;
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  not_applied: "Not applied",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  not_applied: "text-neutral-400",
  applied: "text-blue-600 dark:text-blue-400",
  interviewing: "text-yellow-600 dark:text-yellow-400",
  offer: "text-green-600 dark:text-green-400",
  rejected: "text-red-600 dark:text-red-400",
};

export default function TrackerTable({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");

  async function save(row: Row) {
    setSavingId(row._id);
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
    } finally {
      setSavingId(null);
    }
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => {
      const next = prev.map((r) => (r._id === id ? { ...r, ...patch } : r));
      const updated = next.find((r) => r._id === id);
      if (updated) save(updated);
      return next;
    });
  }

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-sm flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full border ${filter === "all" ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-300 dark:border-neutral-700 text-neutral-500"}`}
        >
          All ({rows.length})
        </button>
        {APPLICATION_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full border ${filter === s ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-300 dark:border-neutral-700 text-neutral-500"}`}
          >
            {STATUS_LABELS[s]} ({rows.filter((r) => r.status === s).length})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map((row) => (
          <div
            key={row._id}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 flex flex-col sm:flex-row sm:items-center gap-2"
          >
            <div className="flex-1 min-w-0">
              <a href={row.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                {row.title}
              </a>
              <div className="text-sm text-neutral-500">{row.company}</div>
            </div>

            <input
              type="text"
              placeholder="notes..."
              defaultValue={row.notes}
              onBlur={(e) => updateRow(row._id, { notes: e.target.value })}
              className="text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 w-full sm:w-48"
            />

            <select
              value={row.status}
              onChange={(e) => updateRow(row._id, { status: e.target.value as ApplicationStatus })}
              className={`text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 font-medium ${STATUS_COLORS[row.status]}`}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s} className="text-neutral-900 dark:text-neutral-100">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            {savingId === row._id && <span className="text-xs text-neutral-400">saving...</span>}
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-neutral-500">No jobs in this status.</p>
        )}
      </div>
    </div>
  );
}
