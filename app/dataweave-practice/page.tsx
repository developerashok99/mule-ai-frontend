import { getDb } from "@/lib/mongodb";
import type { DataWeaveProblem } from "@/lib/types";
import PracticeList from "./PracticeList";

export const dynamic = "force-dynamic";

async function getProblems(): Promise<DataWeaveProblem[]> {
  const db = await getDb();
  const doc = await db.collection<{ _id: string; problems: DataWeaveProblem[] }>("dataweave_practice").findOne({ _id: "current" });
  return doc?.problems ?? [];
}

export default async function DataWeavePracticePage() {
  const problems = await getProblems();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">DataWeave Practice</h1>
        <p className="text-sm text-neutral-500">
          Write the transformation yourself first, then reveal — this is self-checked (compare your own
          output), not auto-graded, since there&apos;s no live DataWeave runtime here.
        </p>
      </div>
      {problems.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Not generated yet — runs from the pipeline repo&apos;s daily job once Groq quota allows.
        </p>
      ) : (
        <PracticeList problems={problems} />
      )}
    </div>
  );
}
