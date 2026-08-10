import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { QuestionProgress, ReviewStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const BOX_INTERVAL_DAYS = { 1: 1, 2: 3, 3: 7 } as const;

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const db = await getDb();
  const progress = await db.collection<QuestionProgress>("question_progress").find({}).toArray();
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const { questionId, status } = (await request.json()) as { questionId?: string; status?: ReviewStatus };
  if (!questionId || !status) {
    return NextResponse.json({ error: "questionId and status are required" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection<QuestionProgress>("question_progress").findOne({ _id: questionId });
  const currentBox = existing?.box ?? 1;

  const nextBox = status === "got_it" ? Math.min(currentBox + 1, 3) : 1;
  const nextReview = addDays(BOX_INTERVAL_DAYS[nextBox as 1 | 2 | 3]);

  await db.collection<QuestionProgress>("question_progress").updateOne(
    { _id: questionId },
    {
      $set: {
        box: nextBox,
        status,
        last_reviewed: new Date().toISOString().slice(0, 10),
        next_review: nextReview,
      },
    },
    { upsert: true },
  );

  return NextResponse.json({ ok: true, box: nextBox, next_review: nextReview });
}
