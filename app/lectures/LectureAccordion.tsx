"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { LectureQA } from "@/lib/types";

export default function LectureAccordion({ chapters }: { chapters: LectureQA[] }) {
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
            <button
              onClick={() => setOpenId(isOpen ? null : chapter._id)}
              className="w-full text-left px-4 py-3 text-sm font-medium flex justify-between items-center"
            >
              <span>{chapter._id.replace(/\.md$/, "")}</span>
              <span className="text-neutral-400">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{chapter.questions_markdown}</ReactMarkdown>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
