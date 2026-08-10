import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a MuleSoft interviewer conducting a live interview for a 3-5 year experience
Developer role. You'll be given a question, a reference model answer, and the candidate's actual spoken answer.

Respond with ONLY a JSON object, no markdown fences, in this exact shape:
{
  "score": <1-5, how complete/accurate the candidate's answer is vs the reference>,
  "feedback": "<2-3 sentences, direct and specific - what they got right, what they missed or got wrong, said the way a real interviewer would think it, not written as a rubric>",
  "follow_up": "<one natural follow-up question a real interviewer would ask next, probing deeper into whatever the candidate's answer left unclear>"
}`;

export async function POST(request: Request) {
  const { question, modelAnswer, userAnswer } = (await request.json()) as {
    question?: string;
    modelAnswer?: string;
    userAnswer?: string;
  };

  if (!question || !userAnswer) {
    return NextResponse.json({ error: "question and userAnswer are required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 });
  }

  const userContent = `Question: ${question}\n\nReference answer: ${modelAnswer}\n\nCandidate's answer: ${userAnswer}`;

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: `Groq API error: ${text}` }, { status: 502 });
    }

    const data = await resp.json();
    let content: string = data.choices[0].message.content.trim();
    content = content.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
