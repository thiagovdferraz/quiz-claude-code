import { NextResponse } from "next/server";
import { SubmitRankingBodySchema } from "@/lib/validation";
import { createServerClient } from "@/lib/supabase";
import { selectProgressiveQuestions } from "@/lib/questions";
import { calcQuestionPoints, calcFinalScore } from "@/lib/scoring";
import { hashIp, getClientIp } from "./validate";
import type { AnswerRecord } from "@/types/quiz";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
// Minimum plausible time for a human to read and answer: 500ms
const MIN_TIME_SPENT_MS = 500;

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("rankings")
    .select("id, nickname, score, correct_count, created_at")
    .order("score", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[ranking GET] supabase error:", error.message, error.code, error.details);
    return NextResponse.json({ error: "Failed to fetch ranking" }, { status: 500 });
  }

  return NextResponse.json(data, { next: { revalidate: 30 } } as ResponseInit);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = SubmitRankingBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { sessionId, nickname, answers } = parsed.data;

  // Fix #1: re-derive the expected question set from sessionId (deterministic seed)
  // and validate that submitted answers use exactly those 15 questions — no duplicates,
  // no foreign IDs, so an attacker cannot repeat an easy question 15 times.
  const expectedQuestions = selectProgressiveQuestions(sessionId);
  const expectedIdSet = new Set(expectedQuestions.map((q) => q.id));
  const submittedIds = answers.map((a) => a.questionId);
  const uniqueSubmittedIds = new Set(submittedIds);

  if (
    uniqueSubmittedIds.size !== 15 ||
    submittedIds.some((id) => !expectedIdSet.has(id))
  ) {
    return NextResponse.json({ error: "Invalid question set" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Fix #6 (part 1): duplicate check; the DB UNIQUE constraint also catches concurrent
  // requests, but we'll handle code 23505 on INSERT to return 409 instead of 500.
  const { data: existing } = await supabase
    .from("rankings")
    .select("id")
    .eq("session_id", sessionId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Session already submitted" }, { status: 409 });
  }

  const ip = getClientIp(request);
  const ipHash = hashIp(ip);
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  // Fix #4: treat a failing count query as a hard error rather than defaulting to 0
  // (which would silently disable the rate limit during DB outages).
  const { count, error: countError } = await supabase
    .from("rankings")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (countError) {
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Recalculate score server-side
  const recalculated: AnswerRecord[] = [];
  let streak = 0;

  for (const answer of answers) {
    // question is guaranteed to exist — validated against expectedIdSet above
    const question = expectedQuestions.find((q) => q.id === answer.questionId)!;
    const correct = answer.userAnswer === question.correctAnswer;

    // Fix #2: clamp timeSpentMs to [MIN_TIME_SPENT_MS, 10000] so a client submitting
    // timeSpentMs=0 cannot claim the maximum 50-point time bonus on every question.
    const clampedTime = Math.min(Math.max(answer.timeSpentMs, MIN_TIME_SPENT_MS), 10000);
    const timeRemaining = Math.max(0, 10000 - clampedTime);
    const points = calcQuestionPoints(question.difficulty, timeRemaining, streak, correct);

    if (correct) streak++;
    else streak = 0;

    recalculated.push({ ...answer, correct, pointsEarned: points });
  }

  const score = calcFinalScore(recalculated);
  const correctCount = recalculated.filter((a) => a.correct).length;

  const { error: insertError } = await supabase.from("rankings").insert({
    nickname,
    score,
    correct_count: correctCount,
    session_id: sessionId,
    ip_hash: ipHash,
  });

  if (insertError) {
    // Fix #6 (part 2): PostgreSQL unique_violation (code 23505) means a concurrent
    // request with the same sessionId won the race — return 409, not 500.
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Session already submitted" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }

  return NextResponse.json({ score, correctCount }, { status: 201 });
}
