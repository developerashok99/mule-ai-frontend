import { getDb } from "@/lib/mongodb";
import type { LectureQA } from "@/lib/types";
import LectureAccordion from "./LectureAccordion";

export const dynamic = "force-dynamic";

async function getChapters(): Promise<LectureQA[]> {
  const db = await getDb();
  return db.collection<LectureQA>("lecture_qna").find({}).sort({ _id: 1 }).toArray();
}

export default async function LecturesPage() {
  const chapters = await getChapters();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Interview Q&A</h1>
        <p className="text-sm text-neutral-500">
          Generated per chapter from your{" "}
          <a
            href="https://github.com/Ashokkumarkarri/Notes"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            Notes
          </a>{" "}
          repo. {chapters.length} chapter{chapters.length === 1 ? "" : "s"} covered so far.
        </p>
      </div>
      {chapters.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No Q&A generated yet — run the pipeline repo&apos;s daily job at least once.
        </p>
      ) : (
        <LectureAccordion chapters={chapters} />
      )}
    </div>
  );
}
