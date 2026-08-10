import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

interface SkillSummaryDoc {
  _id: string;
  summary: string;
  excerpt_count: number;
  generated_date: string;
}

export async function POST(request: Request) {
  const { skill, excerpts } = (await request.json()) as { skill?: string; excerpts?: string[] };
  if (!skill || !excerpts) {
    return NextResponse.json({ error: "skill and excerpts are required" }, { status: 400 });
  }

  const db = await getDb();
  const collection = db.collection<SkillSummaryDoc>("skill_summaries");

  // Cached and still based on the same number of JD mentions - no need to regenerate.
  // A changed excerpt count (new jobs found this skill, or old ones pruned) triggers a refresh.
  const cached = await collection.findOne({ _id: skill });
  if (cached && cached.excerpt_count === excerpts.length) {
    return NextResponse.json({ summary: cached.summary, cached: true });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 });
  }

  const prompt = `Here are real sentences pulled from MuleSoft developer job descriptions, all mentioning "${skill}":

${excerpts.slice(0, 20).map((e) => `- ${e}`).join("\n")}

In 2-3 sentences, summarize what employers are actually expecting regarding "${skill}" for a 3-5 year experience
MuleSoft Developer - grounded specifically in what these excerpts say, not generic knowledge about the topic.
If the excerpts don't say much, say so plainly rather than padding with generic content.`;

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: `Groq API error: ${text}` }, { status: 502 });
    }

    const data = await resp.json();
    const summary: string = data.choices[0].message.content.trim();

    await collection.updateOne(
      { _id: skill },
      { $set: { summary, excerpt_count: excerpts.length, generated_date: new Date().toISOString().slice(0, 10) } },
      { upsert: true },
    );

    return NextResponse.json({ summary, cached: false });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
