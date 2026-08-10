import { getDb } from "@/lib/mongodb";
import type { JobWithCompany } from "@/lib/types";
import JobsList from "./JobsList";
import JobsTrendChart from "./JobsTrendChart";

export const dynamic = "force-dynamic";

async function getJobs(): Promise<JobWithCompany[]> {
  const db = await getDb();
  return db
    .collection("jobs")
    .aggregate<JobWithCompany>([
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo",
        },
      },
      {
        $addFields: {
          company_score: { $first: "$companyInfo.score" },
          company_verdict: { $first: "$companyInfo.verdict" },
        },
      },
      { $project: { companyInfo: 0 } },
      { $match: { closed: { $ne: true } } },
      { $sort: { first_seen_date: -1 } },
    ])
    .toArray();
}

async function getTrend(): Promise<[string, number][]> {
  const db = await getDb();
  const rows = await db
    .collection("jobs")
    .aggregate<{ _id: string; n: number }>([
      { $group: { _id: "$first_seen_date", n: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ])
    .toArray();
  return rows.map((r) => [r._id, r.n]);
}

export default async function JobsPage() {
  const [jobs, trend] = await Promise.all([getJobs(), getTrend()]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Jobs</h1>
        <p className="text-sm text-neutral-500">
          {jobs.length} posting{jobs.length === 1 ? "" : "s"} tracked, company score is 1-10
          (higher = better bet to apply).
        </p>
      </div>

      <JobsTrendChart data={trend} />

      {jobs.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No jobs yet — add companies to the pipeline repo&apos;s{" "}
          <code>src/jobs/sources/companies.json</code>.
        </p>
      ) : (
        <JobsList jobs={jobs} />
      )}
    </div>
  );
}
