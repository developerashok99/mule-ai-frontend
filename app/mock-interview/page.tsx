import { getDb } from "@/lib/mongodb";
import type { LectureQA } from "@/lib/types";
import MockInterview from "./MockInterview";

export const dynamic = "force-dynamic";

async function getAllQuestions() {
  const db = await getDb();
  const chapters = await db.collection<LectureQA>("lecture_qna").find({}).toArray();
  return chapters.flatMap((c) => c.questions ?? []);
}

export default async function MockInterviewPage() {
  const questions = await getAllQuestions();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Mock Interview</h1>
        <p className="text-sm text-neutral-500">
          A random question from the bank, you answer in your own words, the model scores it against
          the reference answer and asks a natural follow-up — the way a real interview actually goes.
        </p>
      </div>
      {questions.length === 0 ? (
        <p className="text-sm text-neutral-500">No questions yet — visit Interview Q&amp;A first.</p>
      ) : (
        <MockInterview questions={questions} />
      )}
    </div>
  );
}
