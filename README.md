# MuleSoft Job Prep — Frontend

A dashboard for the data collected by [AI-mule-jobs-analyzer](https://github.com/developerashok99/AI-mule-jobs-analyzer)
(the daily scrape → analyze → Telegram pipeline). This repo has no dependency on that
one's code — they connect only through a shared MongoDB Atlas database. This app reads
from it (lecture Q&A, jobs, company scores, JD skill-frequency reports) and writes to one
new collection, `applications`, for the tracker page.

## Pages

- **`/`** — dashboard: counts + top skill mentions at a glance
- **`/lectures`** — every generated interview Q&A set, searchable, one chapter expanded at a time
- **`/jobs`** — tracked postings with each company's score/verdict
- **`/skills`** — bar chart of skill/topic mentions across all collected job descriptions
- **`/tracker`** — mark jobs not applied / applied / interviewing / offer / rejected, with notes; saves on change

## Setup

```bash
npm install
cp .env.local.example .env.local   # same MONGODB_URI as the pipeline repo
npm run dev
```

Needs a **write-capable** `MONGODB_URI` (same one the pipeline repo uses is fine) since
the tracker page writes to the `applications` collection.

## Deploy (Vercel, free tier)

1. Push this repo to GitHub.
2. https://vercel.com → New Project → import this repo.
3. Add environment variables `MONGODB_URI` and `MONGODB_DB_NAME` (Project Settings →
   Environment Variables) — same values as `.env.local`.
4. Deploy. Atlas Network Access must allow `0.0.0.0/0` (same requirement as the pipeline
   repo's GitHub Actions) since Vercel's serverless functions don't have a fixed IP either.

## Notes

- Server components (`app/*/page.tsx`) query MongoDB directly at request time — there's no
  separate backend API for reads, on purpose (see `lib/mongodb.ts`). Only the tracker's
  status/notes updates go through an API route (`app/api/applications/route.ts`), since
  that's a client-side write.
- The skill-frequency chart is built with plain divs/Tailwind rather than a charting
  library, following this workspace's `dataviz` skill (sequential single-hue bars, direct
  end-labels, no unnecessary legend for a single series).
