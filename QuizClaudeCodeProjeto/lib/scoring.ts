import type { AnswerRecord, Difficulty } from "@/types/quiz";

const BASE_POINTS: Record<Difficulty, number> = {
  beginner: 100,
  intermediate: 200,
  advanced: 300,
};

export function calcQuestionPoints(
  difficulty: Difficulty,
  timeRemainingMs: number,
  streak: number,
  correct: boolean
): number {
  if (!correct) return 0;
  const base = BASE_POINTS[difficulty];
  const timeBonus = Math.floor((timeRemainingMs / 10000) * 50);
  const streakBonus = Math.min(streak * 20, 100);
  return base + timeBonus + streakBonus;
}

export function calcFinalScore(answers: AnswerRecord[]): number {
  return answers.reduce((sum, a) => sum + a.pointsEarned, 0);
}

export function calcStreakMax(answers: AnswerRecord[]): number {
  let max = 0;
  let current = 0;
  for (const a of answers) {
    if (a.correct) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

export function calcCurrentStreak(answers: AnswerRecord[]): number {
  let streak = 0;
  for (let i = answers.length - 1; i >= 0; i--) {
    if (answers[i].correct) streak++;
    else break;
  }
  return streak;
}
