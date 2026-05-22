import { describe, it, expect } from "vitest";
import {
  calcQuestionPoints,
  calcFinalScore,
  calcStreakMax,
  calcCurrentStreak,
} from "./scoring";
import type { AnswerRecord } from "@/types/quiz";

describe("calcQuestionPoints", () => {
  it("returns 0 on wrong answer", () => {
    expect(calcQuestionPoints("beginner", 5000, 0, false)).toBe(0);
  });

  it("returns base points with no time and no streak", () => {
    expect(calcQuestionPoints("beginner", 0, 0, true)).toBe(100);
    expect(calcQuestionPoints("intermediate", 0, 0, true)).toBe(200);
    expect(calcQuestionPoints("advanced", 0, 0, true)).toBe(300);
  });

  it("adds time bonus correctly (5s remaining = 25 bonus)", () => {
    expect(calcQuestionPoints("beginner", 5000, 0, true)).toBe(125);
  });

  it("adds full time bonus on 10s remaining", () => {
    expect(calcQuestionPoints("beginner", 10000, 0, true)).toBe(150);
  });

  it("caps streak bonus at 100 (5+ streak)", () => {
    expect(calcQuestionPoints("beginner", 0, 5, true)).toBe(200);
    expect(calcQuestionPoints("beginner", 0, 10, true)).toBe(200);
  });

  it("streak bonus is 20 per consecutive correct answer", () => {
    expect(calcQuestionPoints("beginner", 0, 1, true)).toBe(120);
    expect(calcQuestionPoints("beginner", 0, 2, true)).toBe(140);
    expect(calcQuestionPoints("beginner", 0, 3, true)).toBe(160);
  });
});

describe("calcFinalScore", () => {
  it("sums all pointsEarned", () => {
    const answers: AnswerRecord[] = [
      { questionId: "q-001", userAnswer: true, correct: true, timeSpentMs: 3000, pointsEarned: 150 },
      { questionId: "q-002", userAnswer: false, correct: false, timeSpentMs: 10000, pointsEarned: 0 },
      { questionId: "q-003", userAnswer: true, correct: true, timeSpentMs: 2000, pointsEarned: 200 },
    ];
    expect(calcFinalScore(answers)).toBe(350);
  });

  it("returns 0 for empty answers", () => {
    expect(calcFinalScore([])).toBe(0);
  });
});

describe("calcStreakMax", () => {
  it("finds max consecutive streak", () => {
    const answers: AnswerRecord[] = [
      { questionId: "q-001", userAnswer: true, correct: true, timeSpentMs: 1000, pointsEarned: 100 },
      { questionId: "q-002", userAnswer: true, correct: true, timeSpentMs: 1000, pointsEarned: 100 },
      { questionId: "q-003", userAnswer: true, correct: false, timeSpentMs: 1000, pointsEarned: 0 },
      { questionId: "q-004", userAnswer: true, correct: true, timeSpentMs: 1000, pointsEarned: 100 },
      { questionId: "q-005", userAnswer: true, correct: true, timeSpentMs: 1000, pointsEarned: 100 },
      { questionId: "q-006", userAnswer: true, correct: true, timeSpentMs: 1000, pointsEarned: 100 },
    ];
    expect(calcStreakMax(answers)).toBe(3);
  });
});

describe("calcCurrentStreak", () => {
  it("returns streak from end of answers array", () => {
    const answers: AnswerRecord[] = [
      { questionId: "q-001", userAnswer: true, correct: false, timeSpentMs: 1000, pointsEarned: 0 },
      { questionId: "q-002", userAnswer: true, correct: true, timeSpentMs: 1000, pointsEarned: 100 },
      { questionId: "q-003", userAnswer: true, correct: true, timeSpentMs: 1000, pointsEarned: 100 },
    ];
    expect(calcCurrentStreak(answers)).toBe(2);
  });

  it("returns 0 when last answer is wrong", () => {
    const answers: AnswerRecord[] = [
      { questionId: "q-001", userAnswer: true, correct: true, timeSpentMs: 1000, pointsEarned: 100 },
      { questionId: "q-002", userAnswer: true, correct: false, timeSpentMs: 1000, pointsEarned: 0 },
    ];
    expect(calcCurrentStreak(answers)).toBe(0);
  });
});
