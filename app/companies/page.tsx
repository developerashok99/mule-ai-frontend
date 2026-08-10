import { getDb } from "@/lib/mongodb";
import type { Company } from "@/lib/types";

export const dynamic = "force-dynamic";

interface CompanyWithJobCount extends Company {
  job_count: number;
}

async function getCompanies(): Promise<CompanyWithJobCount[]> {
  const db = await getDb();
  return db
    .collection("companies")
    .aggregate<CompanyWithJobCount>([
      {
        $lookup: {
          from: "jobs",
          let: { name: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$company", "$$name"] }, { $ne: ["$closed", true] }] } } },
          ],
          as: "openJobs",
        },
      },
      { $addFields: { job_count: { $size: "$openJobs" } } },
      { $project: { openJobs: 0 } },
      { $sort: { score: -1 } },
    ])
    .toArray();
}

function scoreColor(score: number) {
  if (score >= 7) return "text-green-600 dark:text-green-400";
  if (score >= 4) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Companies</h1>
        <p className="text-sm text-neutral-500">
          Ranked by score (news-based + model judgment), best bet first. {companies.length} scored so far.
        </p>
      </div>

      {companies.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No companies scored yet — runs once the pipeline finds a new posting from a configured company.
        </p>
      ) : (
        <div className="space-y-3">
          {companies.map((c) => (
            <div key={c._id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-medium">{c._id}</div>
                  <div className="text-xs text-neutral-500">
                    {c.job_count} open posting{c.job_count === 1 ? "" : "s"} · scored {c.scored_date}
                  </div>
                </div>
                <div className={`text-lg font-semibold shrink-0 ${scoreColor(c.score)}`}>{c.score}/10</div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{c.verdict}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
