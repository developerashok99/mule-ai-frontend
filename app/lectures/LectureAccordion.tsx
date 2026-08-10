"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { ChapterProgress, LectureQA } from "@/lib/types";

const LEVELS = ["All", "Conceptual", "Scenario/Design", "Debugging"] as const;

function ReviewedToggle({ chapter, initiallyReviewed }: { chapter: string; initiallyReviewed: boolean }) {
  const [reviewed, setReviewed] = useState(initiallyReviewed);
  const [saving, setSaving] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !reviewed;
    setReviewed(next);
    setSaving(true);
    try {
      await fetch("/api/chapter-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter, reviewed: next }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`text-xs px-2 py-1 rounded-full border shrink-0 ${
        reviewed
          ? "border-green-600 text-green-700 dark:text-green-400 dark:border-green-500"
          : "border-neutral-300 dark:border-neutral-700 text-neutral-500"
      }`}
    >
      {reviewed ? "✓ Reviewed" : "Mark reviewed"}
    </button>
  );
}

function ChapterBody({ chapter }: { chapter: LectureQA }) {
  const [tab, setTab] = useState<"qa" | "cheat">("qa");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");

  const questions = chapter.questions ?? [];
  const visible = level === "All" ? questions : questions.filter((q) => q.level === level);

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-4 mb-3 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setTab("qa")}
          className={`text-sm pb-2 -mb-px border-b-2 ${tab === "qa" ? "border-neutral-900 dark:border-neutral-100 font-medium" : "border-transparent text-neutral-500"}`}
        >
          Q&amp;A ({questions.length})
        </button>
        {chapter.cheat_sheet_markdown && (
          <button
            onClick={() => setTab("cheat")}
            className={`text-sm pb-2 -mb-px border-b-2 ${tab === "cheat" ? "border-neutral-900 dark:border-neutral-100 font-medium" : "border-transparent text-neutral-500"}`}
          >
            Cheat sheet
          </button>
        )}
      </div>

      {tab === "qa" && (
        <div className="space-y-4">
          {questions.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    level === l
                      ? "border-neutral-900 dark:border-neutral-100"
                      : "border-neutral-300 dark:border-neutral-700 text-neutral-500"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {visible.length > 0 ? (
              visible.map((q) => (
                <div key={q._id} className="mb-4">
                  <p className="font-semibold mb-0">
                    Q: {q.question} <span className="text-xs font-normal text-neutral-400">({q.level})</span>
                  </p>
                  <ReactMarkdown>{q.answer}</ReactMarkdown>
                </div>
              ))
            ) : (
              <ReactMarkdown>{chapter.questions_markdown}</ReactMarkdown>
            )}
          </div>
        </div>
      )}

      {tab === "cheat" && chapter.cheat_sheet_markdown && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{chapter.cheat_sheet_markdown}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function LectureAccordion({
  chapters,
  progress,
}: {
  chapters: LectureQA[];
  progress: Record<string, ChapterProgress>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = chapters.filter((c) =>
    c._id.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search chapters..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
      />

      {filtered.map((chapter) => {
        const isOpen = openId === chapter._id;
        return (
          <div
            key={chapter._id}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpenId(isOpen ? null : chapter._id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpenId(isOpen ? null : chapter._id)}
              className="w-full text-left px-4 py-3 text-sm font-medium flex justify-between items-center gap-3 cursor-pointer"
            >
              <span className="min-w-0 truncate">{chapter._id.replace(/\.md$/, "")}</span>
              <div className="flex items-center gap-2 shrink-0">
                <ReviewedToggle chapter={chapter._id} initiallyReviewed={!!progress[chapter._id]?.reviewed} />
                <span className="text-neutral-400">{isOpen ? "−" : "+"}</span>
              </div>
            </div>
            {isOpen && <ChapterBody chapter={chapter} />}
          </div>
        );
      })}
    </div>
  );
}
