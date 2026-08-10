# MuleSoft Job Prep — Frontend

A dashboard for the data collected by [AI-mule-jobs-analyzer](https://github.com/developerashok99/AI-mule-jobs-analyzer)
(the daily scrape → analyze → Telegram pipeline). This repo has no dependency on that
one's code — they connect only through a shared MongoDB Atlas database.

## Pages

**Study**
- **`/lectures`** — every generated interview Q&A set, filterable by question type (Conceptual/Scenario-Design/
  Debugging), plus a per-chapter cheat sheet tab and a "mark reviewed" toggle
- **`/review`** — spaced-repetition queue across all generated questions (Leitner-style: rate yourself, shaky
  ones come back sooner)
- **`/mock-interview`** — a random question from the bank, you answer in your own words, live-scored against the
  reference answer with a natural follow-up question (calls Groq directly from the browser)
- **`/dataweave-practice`** — reveal-based practice transformation problems
- **`/skills`** — bar chart of skill/topic mentions across all collected job descriptions, cross-referenced
  against which chapters you've covered

**Jobs**
- **`/jobs`** — tracked postings with salary (where extracted), company score, location filter, a jobs-per-day
  trend chart
- **`/companies`** — every scored company ranked best-to-worst, with open posting counts
- **`/resume-match`** — paste your resume (kept in your browser only), see which of a job's commonly-required
  skills it doesn't mention yet
- **`/tracker`** — mark jobs not applied / applied / interviewing / offer / rejected, with notes; saves on change

**`/`** — dashboard: study countdown, chapter-review progress, tracked counts, top skill mentions

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Needs:
- A **write-capable** `MONGODB_URI` (same one the pipeline repo uses is fine) — most pages only read, but the
  tracker, chapter-progress, and review-queue features write to Mongo.
- `GROQ_API_KEY` — same key as the pipeline repo works, but set it here too. The Mock Interview page calls Groq
  live from an API route on every submitted answer, which is a different call pattern from the pipeline's batch
  generation, so it needs its own key configured in this repo's environment.
- `STUDY_DEADLINE` (optional) — shown on the dashboard countdown, defaults to 2026-09-08.

## Deploy (Vercel, free tier)

1. Push this repo to GitHub.
2. https://vercel.com → New Project → import this repo.
3. Add environment variables `MONGODB_URI`, `MONGODB_DB_NAME`, `GROQ_API_KEY`, `GROQ_MODEL`, `STUDY_DEADLINE`
   (Project Settings → Environment Variables) — same values as `.env.local`.
4. Deploy. Atlas Network Access must allow `0.0.0.0/0` (same requirement as the pipeline repo's GitHub Actions)
   since Vercel's serverless functions don't have a fixed IP either — a single-IP-only allow list produces a
   TLS-handshake-looking failure at build/request time that's actually just the IP being rejected.

## Notes

- Server components (`app/*/page.tsx`) query MongoDB directly at request time — there's no
  separate backend API for reads, on purpose (see `lib/mongodb.ts`). API routes exist only for client-side writes
  (`applications`, `chapter-progress`, `question-progress`) and the one live-inference call (`mock-interview`).
- The skill-frequency and jobs-trend charts are built with plain divs/Tailwind rather than a charting
  library, following this workspace's `dataviz` skill (sequential single-hue bars/columns, direct
  end-labels, no unnecessary legend for a single series).
- `lib/skills.ts` is a hand-kept copy of the pipeline repo's `src/jobs/skills_taxonomy.py` skill list (used by
  the skill-gap view and resume matcher) — if you edit one, edit the other.
- No authentication on any page or API route, intentionally — this is treated as a personal, low-stakes tool, not
  a public product.
