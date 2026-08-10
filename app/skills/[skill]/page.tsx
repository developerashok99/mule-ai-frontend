import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import type { Job, LectureQA, Question } from "@/lib/types";
import { SKILLS, matchesSkill, extractExcerpts } from "@/lib/skills";
import SkillSummary from "./SkillSummary";

export const dynamic = "force-dynamic";

async function getData(skill: string) {
  const db = await getDb();
  const [chapters, jobs] = await Promise.all([
    db.collection<LectureQA>("lecture_qna").find({}).toArray(),
    db.collection<Job>("jobs").find({ closed: { $ne: true } }).toArray(),
  ]);

  const allQuestions: Question[] = chapters.flatMap((c) => c.questions ?? []);
  const matchingQuestions = allQuestions.filter(
    (q) => matchesSkill(q.question, skill) || matchesSkill(q.answer, skill),
  );

  const excerpts: { company: string; title: string; text: string; url: string }[] = [];
  const seenText = new Set<string>();
  for (const job of jobs) {
    const found = extractExcerpts(job.description, skill);
    for (const text of found) {
      // companies frequently reuse the same boilerplate paragraph across postings -
      // one real example is more useful than the same sentence five times over
      if (seenText.has(text)) continue;
      seenText.add(text);
      excerpts.push({ company: job.company, title: job.title, text, url: job.url });
    }
  }

  return { matchingQuestions, excerpts };
}

export default async function SkillDetailPage({ params }: PageProps<"/skills/[skill]">) {
  const { skill: rawSkill } = await params;
  const skill = decodeURIComponent(rawSkill);

  if (!SKILLS.includes(skill)) {
    notFound();
  }

  const { matchingQuestions, excerpts } = await getData(skill);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/skills" className="text-sm text-blue-600 dark:text-blue-400">
          ← Skill Gaps
        </Link>
        <h1 className="text-xl font-semibold mt-1 mb-1">{skill}</h1>
        <p className="text-sm text-neutral-500">
          {matchingQuestions.length} interview question{matchingQuestions.length === 1 ? "" : "s"} touch on this ·{" "}
          mentioned in {excerpts.length} job description excerpt{excerpts.length === 1 ? "" : "s"}
        </p>
      </div>

      <SkillSummary skill={skill} excerpts={excerpts.map((e) => e.text)} />

      <div>
        <h2 className="text-sm font-semibold mb-2">Interview questions on this</h2>
        {matchingQuestions.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No generated questions touch on this specifically yet — it may show up as part of a broader question.
          </p>
        ) : (
          <div className="space-y-3">
            {matchingQuestions.map((q) => (
              <div key={q._id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                  {q.level} · {q.chapter.replace(/\.md$/, "")}
                </div>
                <p className="font-medium text-sm mb-2">{q.question}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{q.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Where it shows up in real job descriptions</h2>
        {excerpts.length === 0 ? (
          <p className="text-sm text-neutral-500">No tracked JD currently mentions this in extractable sentence form.</p>
        ) : (
          <div className="space-y-2">
            {excerpts.map((e, i) => (
              <div key={i} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
                <p className="text-sm">&ldquo;{e.text}&rdquo;</p>
                <a href={e.url} target="_blank" rel="noreferrer" className="text-xs text-neutral-500 hover:underline">
                  {e.company} — {e.title}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
