import type { Question, Difficulty } from "@/types/quiz";
import questionsData from "@/data/questions.json";

const allQuestions = questionsData as Question[];

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  let state = Math.abs(hash);
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0x100000000; // divide by 2^32 → range [0, 1) never reaches 1.0
  };
}

function shuffleWithSeed<T>(arr: T[], rand: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickByDifficulty(
  difficulty: Difficulty,
  count: number,
  rand: () => number
): Question[] {
  const pool = allQuestions.filter((q) => q.difficulty === difficulty);
  return shuffleWithSeed(pool, rand).slice(0, count);
}

export function selectProgressiveQuestions(seed: string): Question[] {
  const rand = seededRandom(seed);
  return [
    ...pickByDifficulty("beginner", 5, rand),
    ...pickByDifficulty("intermediate", 6, rand),
    ...pickByDifficulty("advanced", 4, rand),
  ];
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}
