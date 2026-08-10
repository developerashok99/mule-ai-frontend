import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import type { Application, JdReport } from "@/lib/types";

async function getSummary() {
  const db = await getDb();
  const [chapterCount, jobCount, companyCount, latestReport, applications] = await Promise.all([
    db.collection("lecture_qna").countDocuments({}),
    db.collection("jobs").countDocuments({}),
    db.collection("companies").countDocuments({}),
    db.collection<JdReport>("jd_reports").find({}).sort({ _id: -1 }).limit(1).toArray(),
    db.collection<Application>("applications").find({}).toArray(),
  ]);

  const topSkills = latestReport[0]
    ? Object.entries(latestReport[0].counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  const applied = applications.filter((a) => a.status !== "not_applied").length;

  return { chapterCount, jobCount, companyCount, topSkills, applied };
}

function StatCard({ label, value, href }: { label: string; value: string | number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
    >
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-neutral-500">{label}</div>
    </Link>
  );
}

export default async function DashboardPage() {
  const { chapterCount, jobCount, companyCount, topSkills, applied } = await getSummary();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Daily pipeline output, pulled straight from the shared MongoDB store.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Chapters with Q&A" value={chapterCount} href="/lectures" />
        <StatCard label="Jobs tracked" value={jobCount} href="/jobs" />
        <StatCard label="Companies scored" value={companyCount} href="/jobs" />
        <StatCard label="Applications in progress" value={applied} href="/tracker" />
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Top skills mentioned in job descriptions</h2>
        {topSkills.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No JD data yet — add companies to the pipeline&apos;s <code>companies.json</code>.
          </p>
        ) : (
          <ul className="text-sm space-y-1">
            {topSkills.map(([skill, count]) => (
              <li key={skill} className="flex justify-between border-b border-neutral-100 dark:border-neutral-900 py-1">
                <span>{skill}</span>
                <span className="text-neutral-500">{count} mentions</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/skills" className="text-sm text-blue-600 dark:text-blue-400 inline-block mt-2">
          View full skill-gap dashboard →
        </Link>
      </div>
    </div>
  );
}
