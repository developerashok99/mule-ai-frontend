import { getDb } from "@/lib/mongodb";
import type { JdReport, LectureQA } from "@/lib/types";
import { SKILLS, coveredChapters } from "@/lib/skills";
import SkillBarChart from "./SkillBarChart";

export const dynamic = "force-dynamic";

async function getData() {
  const db = await getDb();
  const [latest] = await db
    .collection<JdReport>("jd_reports")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray();
  const jobCount = await db.collection("jobs").countDocuments({});
  const chapters = await db.collection<LectureQA>("lecture_qna").find({}, { projection: { _id: 1 } }).toArray();
  return { latest, jobCount, chapterNames: chapters.map((c) => c._id) };
}

export default async function SkillsPage() {
  const { latest, jobCount, chapterNames } = await getData();
  const sorted = latest
    ? (Object.entries(latest.counts).sort((a, b) => b[1] - a[1]) as [string, number][])
    : [];

  const coveredSkills = new Set(
    SKILLS.filter((skill) => coveredChapters(skill, chapterNames).length > 0),
  );
  const gapCount = sorted.filter(([skill]) => !coveredSkills.has(skill)).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Skill Gaps</h1>
        <p className="text-sm text-neutral-500">
          {latest
            ? `How often each MuleSoft skill/topic shows up across ${jobCount} tracked job description${jobCount === 1 ? "" : "s"}, as of ${latest._id}, cross-referenced against which chapters you've studied.`
            : "No JD skill-frequency data yet."}
        </p>
        {sorted.length > 0 && (
          <p className="text-sm mt-1">
            <span className="font-medium" style={{ color: gapCount > 0 ? "var(--viz-warn, #a5680f)" : undefined }}>
              {gapCount} skill{gapCount === 1 ? "" : "s"} mentioned in real JDs aren&apos;t covered by any studied
              chapter yet.
            </span>
          </p>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Runs once the pipeline repo has companies configured and has collected at least
          one job description.
        </p>
      ) : (
        <SkillBarChart data={sorted} jobCount={jobCount} coveredSkills={coveredSkills} />
      )}
    </div>
  );
}
