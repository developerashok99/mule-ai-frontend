import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { ChapterProgress } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const progress = await db.collection<ChapterProgress>("chapter_progress").find({}).toArray();
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const { chapter, reviewed } = (await request.json()) as { chapter?: string; reviewed?: boolean };
  if (!chapter) {
    return NextResponse.json({ error: "chapter is required" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection<ChapterProgress>("chapter_progress").updateOne(
    { _id: chapter },
    { $set: { reviewed: !!reviewed, reviewed_date: new Date().toISOString().slice(0, 10) } },
    { upsert: true },
  );
  return NextResponse.json({ ok: true });
}
