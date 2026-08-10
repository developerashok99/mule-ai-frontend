import { getDb } from "@/lib/mongodb";
import type { LectureQA, QuestionProgress } from "@/lib/types";
import ReviewQueue from "./ReviewQueue";

export const dynamic = "force-dynamic";

async function getDueQuestions() {
  const db = await getDb();
  const [chapters, progressDocs] = await Promise.all([
    db.collection<LectureQA>("lecture_qna").find({}).sort({ _id: 1 }).toArray(),
    db.collection<QuestionProgress>("question_progress").find({}).toArray(),
  ]);
  const progress = Object.fromEntries(progressDocs.map((p) => [p._id, p]));
  const today = new Date().toISOString().slice(0, 10);

  const allQuestions = chapters.flatMap((c) => c.questions ?? []);
  const due = allQuestions.filter((q) => {
    const p = progress[q._id];
    return !p || p.next_review <= today;
  });

  return {
    due,
    totalQuestions: allQuestions.length,
    neverReviewed: allQuestions.filter((q) => !progress[q._id]).length,
  };
}

export default async function ReviewPage() {
  const { due, totalQuestions, neverReviewed } = await getDueQuestions();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Review Queue</h1>
        <p className="text-sm text-neutral-500">
          Spaced repetition across all {totalQuestions} generated questions — rate each one honestly,
          the ones you&apos;re shaky on come back sooner. {neverReviewed} question{neverReviewed === 1 ? "" : "s"}{" "}
          you haven&apos;t reviewed yet.
        </p>
      </div>

      {totalQuestions === 0 ? (
        <p className="text-sm text-neutral-500">No questions yet — visit Interview Q&amp;A first.</p>
      ) : (
        <ReviewQueue initialQueue={due} />
      )}
    </div>
  );
}
