"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";

interface Feedback {
  score: number;
  feedback: string;
  follow_up: string;
}

function randomQuestion(questions: Question[], excludeId?: string): Question {
  const pool = excludeId ? questions.filter((q) => q._id !== excludeId) : questions;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function MockInterview({ questions }: { questions: Question[] }) {
  const [current, setCurrent] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function start() {
    setCurrent(randomQuestion(questions));
    setAnswer("");
    setFeedback(null);
    setError(null);
  }

  async function submit() {
    if (!current || !answer.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: current.question, modelAnswer: current.answer, userAnswer: answer }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Something went wrong");
      setFeedback(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function next() {
    setCurrent((c) => randomQuestion(questions, c?._id));
    setAnswer("");
    setFeedback(null);
    setError(null);
  }

  if (!current) {
    return (
      <button onClick={start} className="text-sm px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700">
        Start interview
      </button>
    );
  }

  const scoreColor = feedback
    ? feedback.score >= 4
      ? "text-green-600 dark:text-green-400"
      : feedback.score >= 3
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400"
    : "";

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
      <div>
        <div className="text-xs font-medium text-neutral-400 mb-1 uppercase tracking-wide">
          {current.level} · {current.chapter.replace(/\.md$/, "")}
        </div>
        <p className="font-medium">{current.question}</p>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={!!feedback}
        placeholder="Answer out loud in your head, then type what you'd say..."
        rows={5}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm disabled:opacity-60"
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!feedback ? (
        <button
          onClick={submit}
          disabled={loading || !answer.trim()}
          className="text-sm px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 disabled:opacity-50"
        >
          {loading ? "Scoring..." : "Submit answer"}
        </button>
      ) : (
        <div className="space-y-3 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <div className={`text-sm font-semibold ${scoreColor}`}>Score: {feedback.score}/5</div>
          <p className="text-sm">{feedback.feedback}</p>
          <p className="text-sm text-neutral-500">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">Reference answer: </span>
            {current.answer}
          </p>
          <p className="text-sm text-neutral-500">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">A real interviewer would probably ask next: </span>
            {feedback.follow_up}
          </p>
          <button onClick={next} className="text-sm px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700">
            Next question
          </button>
        </div>
      )}
    </div>
  );
}
