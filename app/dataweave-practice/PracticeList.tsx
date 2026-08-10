"use client";

import { useState } from "react";
import type { DataWeaveProblem } from "@/lib/types";

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "text-green-600 dark:text-green-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  hard: "text-red-600 dark:text-red-400",
};

function ProblemCard({ problem, index }: { problem: DataWeaveProblem; index: number }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-sm">
          {index + 1}. {problem.task}
        </p>
        <span className={`text-xs font-medium shrink-0 uppercase ${DIFFICULTY_COLOR[problem.difficulty] ?? ""}`}>
          {problem.difficulty}
        </span>
      </div>

      <div>
        <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Sample input</div>
        <pre className="text-xs bg-neutral-100 dark:bg-neutral-900 rounded-md p-3 overflow-x-auto">
          {JSON.stringify(problem.sample_input, null, 2)}
        </pre>
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700"
        >
          Reveal solution
        </button>
      ) : (
        <>
          <div>
            <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Expected output</div>
            <pre className="text-xs bg-neutral-100 dark:bg-neutral-900 rounded-md p-3 overflow-x-auto">
              {JSON.stringify(problem.expected_output, null, 2)}
            </pre>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Reference solution</div>
            <pre className="text-xs bg-neutral-100 dark:bg-neutral-900 rounded-md p-3 overflow-x-auto">
              {problem.reference_solution}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

export default function PracticeList({ problems }: { problems: DataWeaveProblem[] }) {
  return (
    <div className="space-y-3">
      {problems.map((p, i) => (
        <ProblemCard key={p._id} problem={p} index={i} />
      ))}
    </div>
  );
}
