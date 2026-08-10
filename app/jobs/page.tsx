import { getDb } from "@/lib/mongodb";
import type { JobWithCompany } from "@/lib/types";
import JobsList from "./JobsList";

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
      { $sort: { first_seen_date: -1 } },
    ])
    .toArray();
}

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Jobs</h1>
        <p className="text-sm text-neutral-500">
          {jobs.length} posting{jobs.length === 1 ? "" : "s"} tracked, company score is 1-10
          (higher = better bet to apply).
        </p>
      </div>

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
