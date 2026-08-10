import { getDb } from "@/lib/mongodb";
import type { Job } from "@/lib/types";
import ResumeMatcher from "./ResumeMatcher";

export const dynamic = "force-dynamic";

async function getJobs(): Promise<Job[]> {
  const db = await getDb();
  return db.collection<Job>("jobs").find({}).sort({ first_seen_date: -1 }).toArray();
}

export default async function ResumeMatchPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Resume Match</h1>
        <p className="text-sm text-neutral-500">
          Paste your resume once (kept in your browser only, never sent anywhere but this page), pick a
          tracked job, and see which of its commonly-required skills your resume doesn&apos;t mention yet.
        </p>
      </div>
      <ResumeMatcher jobs={jobs} />
    </div>
  );
}
