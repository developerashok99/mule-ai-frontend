import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { Application } from "@/lib/types";

export async function GET() {
  const db = await getDb();
  const applications = await db
    .collection<Application>("applications")
    .find({})
    .sort({ updated_date: -1 })
    .toArray();
  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { _id, company, title, url, status, notes } = body as Partial<Application>;

  if (!_id || !company || !title) {
    return NextResponse.json(
      { error: "_id, company, and title are required" },
      { status: 400 },
    );
  }

  const db = await getDb();
  await db.collection<Application>("applications").updateOne(
    { _id },
    {
      $set: {
        company,
        title,
        url: url ?? "",
        status: status ?? "not_applied",
        notes: notes ?? "",
        updated_date: new Date().toISOString().slice(0, 10),
      },
    },
    { upsert: true },
  );

  return NextResponse.json({ ok: true });
}
