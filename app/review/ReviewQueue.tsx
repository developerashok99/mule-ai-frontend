"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Question, ReviewStatus } from "@/lib/types";

export default function ReviewQueue({ initialQueue }: { initialQueue: Question[] }) {
  const [queue, setQueue] = useState(initialQueue);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);

  const current = queue[index];

  async function rate(status: ReviewStatus) {
    await fetch("/api/question-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: current._id, status }),
    });
    setDone((d) => d + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  if (queue.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
        <p className="text-sm text-neutral-500">Nothing due for review right now — check back tomorrow.</p>
      </div>
    );
  }

  if (index >= queue.length) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
        <p className="font-medium">Queue cleared — reviewed {done} question{done === 1 ? "" : "s"}.</p>
        <button
          onClick={() => { setIndex(0); setQueue(initialQueue); }}
          className="text-sm text-blue-600 dark:text-blue-400 mt-2"
        >
          Go again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-neutral-500">
        {index + 1} of {queue.length} · {current.chapter.replace(/\.md$/, "")}
      </div>
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wide">{current.level}</div>
        <p className="font-medium mb-4">{current.question}</p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="text-sm px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700"
          >
            Reveal answer
          </button>
        ) : (
          <>
            <div className="prose prose-sm dark:prose-invert max-w-none border-t border-neutral-200 dark:border-neutral-800 pt-4">
              <ReactMarkdown>{current.answer}</ReactMarkdown>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => rate("missed")}
                className="flex-1 text-sm px-3 py-2 rounded-md border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400"
              >
                Missed it
              </button>
              <button
                onClick={() => rate("shaky")}
                className="flex-1 text-sm px-3 py-2 rounded-md border border-yellow-300 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400"
              >
                Shaky
              </button>
              <button
                onClick={() => rate("got_it")}
                className="flex-1 text-sm px-3 py-2 rounded-md border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400"
              >
                Got it
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
