import { NextResponse } from "next/server";
import { selectProgressiveQuestions } from "@/lib/questions";

export async function POST() {
  const sessionId = crypto.randomUUID();
  const questions = selectProgressiveQuestions(sessionId);

  return NextResponse.json({ sessionId, questions });
}
