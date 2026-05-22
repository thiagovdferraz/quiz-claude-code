"use client";

import { useEffect, useReducer, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import type { Question, AnswerRecord, GameSession } from "@/types/quiz";
import { calcQuestionPoints, calcCurrentStreak, calcStreakMax } from "@/lib/scoring";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { Feedback } from "@/components/quiz/Feedback";
import { Timer } from "@/components/quiz/Timer";
import { ScoreDisplay } from "@/components/quiz/ScoreDisplay";

type GamePhase = "loading" | "error" | "in_progress" | "feedback";

interface GameState {
  phase: GamePhase;
  errorMsg: string;
  sessionId: string;
  questions: Question[];
  index: number;
  answers: AnswerRecord[];
  lastAnswer: AnswerRecord | null;
  timerKey: number;
}

const initial: GameState = {
  phase: "loading",
  errorMsg: "",
  sessionId: "",
  questions: [],
  index: 0,
  answers: [],
  lastAnswer: null,
  timerKey: 0,
};

type Action =
  | { type: "START"; sessionId: string; questions: Question[] }
  | { type: "ANSWER"; record: AnswerRecord }
  | { type: "NEXT" }
  | { type: "ERROR"; message: string };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "ERROR":
      return { ...state, phase: "error", errorMsg: action.message };
    case "START":
      return { ...initial, phase: "in_progress", sessionId: action.sessionId, questions: action.questions };
    case "ANSWER":
      return { ...state, phase: "feedback", answers: [...state.answers, action.record], lastAnswer: action.record };
    case "NEXT":
      return { ...state, phase: "in_progress", index: state.index + 1, lastAnswer: null, timerKey: state.timerKey + 1 };
    default:
      return state;
  }
}

export default function QuizPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initial);
  const questionStartRef = useRef<number>(0);

  useEffect(() => {
    questionStartRef.current = Date.now();
    fetch("/api/quiz/start", { method: "POST" })
      .then((r) => r.json())
      .then(({ sessionId, questions }) => dispatch({ type: "START", sessionId, questions }))
      .catch(() => dispatch({ type: "ERROR", message: "Falha ao carregar perguntas." }));
  }, []);

  // Reset timer ref when index changes (new question)
  useEffect(() => {
    if (state.phase === "in_progress") {
      questionStartRef.current = Date.now();
    }
  }, [state.index, state.phase]);

  const submitAnswer = useCallback(
    (userAnswer: boolean | null) => {
      if (state.phase !== "in_progress") return;
      const question = state.questions[state.index];
      const timeSpentMs = Math.min(Date.now() - questionStartRef.current, 10000);
      const correct = userAnswer === question.correctAnswer;
      const timeRemaining = Math.max(0, 10000 - timeSpentMs);
      const streak = calcCurrentStreak(state.answers);
      const points = calcQuestionPoints(question.difficulty, timeRemaining, streak, correct);

      dispatch({
        type: "ANSWER",
        record: { questionId: question.id, userAnswer, correct, timeSpentMs, pointsEarned: points },
      });
    },
    [state]
  );

  const handleNext = useCallback(() => {
    if (state.phase !== "feedback") return;
    const nextIndex = state.index + 1;

    if (nextIndex >= state.questions.length) {
      const totalScore = state.answers.reduce((s, a) => s + a.pointsEarned, 0);
      const session: GameSession = {
        sessionId: state.sessionId,
        startedAt: new Date(Date.now() - state.questions.length * 5000).toISOString(),
        finishedAt: new Date().toISOString(),
        questions: state.questions,
        answers: state.answers,
        totalScore,
        streakMax: calcStreakMax(state.answers),
      };
      sessionStorage.setItem("quiz_session", JSON.stringify(session));
      router.push("/resultado");
    } else {
      dispatch({ type: "NEXT" });
    }
  }, [state, router]);

  if (state.phase === "loading") {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-text-secondary animate-pulse">Carregando perguntas…</p>
      </main>
    );
  }

  if (state.phase === "error") {
    return (
      <main className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-error">{state.errorMsg}</p>
        <Link href="/" className="text-accent underline">Voltar ao início</Link>
      </main>
    );
  }

  const question = state.questions[state.index];
  const currentScore = state.answers.reduce((s, a) => s + a.pointsEarned, 0);
  const currentStreak = calcCurrentStreak(state.answers);

  return (
    <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-4">
      <ScoreDisplay
        current={state.index + 1}
        total={state.questions.length}
        score={currentScore}
        streak={currentStreak}
      />

      <Timer
        key={state.timerKey}
        durationMs={10000}
        running={state.phase === "in_progress"}
        onExpire={() => submitAnswer(null)}
      />

      <AnimatePresence mode="wait">
        {state.phase === "in_progress" ? (
          <QuestionCard
            key={`q-${state.index}`}
            question={question}
            disabled={false}
            onAnswer={submitAnswer}
          />
        ) : state.lastAnswer ? (
          <Feedback
            key={`f-${state.index}`}
            question={question}
            userAnswer={state.lastAnswer.userAnswer}
            correct={state.lastAnswer.correct}
            pointsEarned={state.lastAnswer.pointsEarned}
            streak={currentStreak}
            onNext={handleNext}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
