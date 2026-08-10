import { getDb } from "@/lib/mongodb";
import type { Application, Job } from "@/lib/types";
import TrackerTable from "./TrackerTable";

async function getRows() {
  const db = await getDb();
  const [jobs, applications] = await Promise.all([
    db.collection<Job>("jobs").find({}).sort({ first_seen_date: -1 }).toArray(),
    db.collection<Application>("applications").find({}).toArray(),
  ]);

  const appById = new Map(applications.map((a) => [a._id, a]));

  return jobs.map((job) => {
    const app = appById.get(job._id);
    return {
      _id: job._id,
      company: job.company,
      title: job.title,
      url: job.url,
      status: app?.status ?? "not_applied",
      notes: app?.notes ?? "",
    };
  });
}

export default async function TrackerPage() {
  const rows = await getRows();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Application Tracker</h1>
        <p className="text-sm text-neutral-500">
          Status updates save automatically. {rows.length} job{rows.length === 1 ? "" : "s"} total.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No jobs yet — add companies to the pipeline repo&apos;s{" "}
          <code>src/jobs/sources/companies.json</code>.
        </p>
      ) : (
        <TrackerTable initialRows={rows} />
      )}
    </div>
  );
}
