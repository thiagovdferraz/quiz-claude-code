export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Category =
  | "fundamentals"
  | "features"
  | "api-sdk"
  | "best-practices";

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  statement: string;
  correctAnswer: boolean;
  explanation: string;
}

export interface AnswerRecord {
  questionId: string;
  userAnswer: boolean | null; // null = timeout
  correct: boolean;
  timeSpentMs: number;
  pointsEarned: number;
}

export interface GameSession {
  sessionId: string;
  startedAt: string;
  finishedAt?: string;
  questions: Question[];
  answers: AnswerRecord[];
  totalScore: number;
  streakMax: number;
}

export interface RankingEntry {
  id: string;
  nickname: string;
  score: number;
  correctCount: number;
  createdAt: string;
}
