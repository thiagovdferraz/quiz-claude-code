"use client";

import { motion } from "framer-motion";
import type { Question } from "@/types/quiz";

interface FeedbackProps {
  question: Question;
  userAnswer: boolean | null;
  correct: boolean;
  pointsEarned: number;
  streak: number;
  onNext: () => void;
}

export function Feedback({ question, userAnswer, correct, pointsEarned, streak, onNext }: FeedbackProps) {
  const timeout = userAnswer === null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      role="status"
      aria-live="assertive"
      className="bg-base-card rounded-2xl border border-border p-6 flex flex-col gap-5"
    >
      <div className="flex items-center gap-3">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`text-4xl ${correct ? "text-success" : "text-error"}`}
          aria-hidden="true"
        >
          {correct ? "✓" : "✗"}
        </motion.span>
        <div>
          <p className={`font-bold text-lg ${correct ? "text-success" : "text-error"}`}>
            {timeout ? "Tempo esgotado!" : correct ? "Correto!" : "Incorreto!"}
          </p>
          <p className="text-text-secondary text-sm">
            Resposta correta:{" "}
            <span className="font-semibold text-text-primary">
              {question.correctAnswer ? "Verdadeiro" : "Falso"}
            </span>
          </p>
        </div>
        {correct && pointsEarned > 0 && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-auto text-accent font-bold text-lg tabular-nums"
          >
            +{pointsEarned}
          </motion.span>
        )}
      </div>

      {streak >= 2 && correct && (
        <p className="text-amber-400 text-sm font-medium">
          🔥 Sequência de {streak} acertos!
        </p>
      )}

      <div className="bg-base rounded-xl border border-border p-4">
        <p className="text-text-secondary text-sm leading-relaxed font-mono">
          {question.explanation}
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full min-h-[48px] rounded-2xl bg-accent text-white font-bold transition-all hover:bg-accent-light hover:text-base active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Próxima pergunta
      </button>
    </motion.div>
  );
}
