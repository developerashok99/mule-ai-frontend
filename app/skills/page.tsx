import { getDb } from "@/lib/mongodb";
import type { JdReport } from "@/lib/types";
import SkillBarChart from "./SkillBarChart";

export const dynamic = "force-dynamic";

async function getLatestReport() {
  const db = await getDb();
  const [latest] = await db
    .collection<JdReport>("jd_reports")
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray();
  const jobCount = await db.collection("jobs").countDocuments({});
  return { latest, jobCount };
}

export default async function SkillsPage() {
  const { latest, jobCount } = await getLatestReport();
  const sorted = latest
    ? (Object.entries(latest.counts).sort((a, b) => b[1] - a[1]) as [string, number][])
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Skill Gaps</h1>
        <p className="text-sm text-neutral-500">
          {latest
            ? `How often each MuleSoft skill/topic shows up across ${jobCount} tracked job description${jobCount === 1 ? "" : "s"}, as of ${latest._id}. Study time is best spent on what's high here.`
            : "No JD skill-frequency data yet."}
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Runs once the pipeline repo has companies configured and has collected at least
          one job description.
        </p>
      ) : (
        <SkillBarChart data={sorted} jobCount={jobCount} />
      )}
    </div>
  );
}
