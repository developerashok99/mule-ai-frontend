import { getDb } from "@/lib/mongodb";
import type { JobWithCompany } from "@/lib/types";

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

function scoreColor(score?: number) {
  if (score === undefined) return "text-neutral-400";
  if (score >= 7) return "text-green-600 dark:text-green-400";
  if (score >= 4) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
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
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                  >
                    {job.title}
                  </a>
                  <div className="text-sm text-neutral-500">
                    {job.company} · {job.location || "location n/a"} · via {job.source}
                  </div>
                </div>
                {job.company_score !== undefined && (
                  <div className={`text-sm font-semibold shrink-0 ${scoreColor(job.company_score)}`}>
                    {job.company_score}/10
                  </div>
                )}
              </div>
              {job.company_verdict && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  {job.company_verdict}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
