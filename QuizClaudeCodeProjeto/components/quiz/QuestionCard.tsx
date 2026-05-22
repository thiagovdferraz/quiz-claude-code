"use client";

import { motion } from "framer-motion";
import type { Question } from "@/types/quiz";

const DIFFICULTY_LABEL: Record<Question["difficulty"], string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const CATEGORY_LABEL: Record<Question["category"], string> = {
  fundamentals: "Fundamentos",
  features: "Features",
  "api-sdk": "API / SDK",
  "best-practices": "Boas Práticas",
};

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: boolean) => void;
  disabled: boolean;
}

export function QuestionCard({ question, onAnswer, disabled }: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      className="bg-base-card rounded-2xl border border-border p-6 flex flex-col gap-6"
    >
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs px-2 py-1 rounded-full border border-border text-text-secondary">
          {CATEGORY_LABEL[question.category]}
        </span>
        <span className="text-xs px-2 py-1 rounded-full border border-border text-text-secondary">
          {DIFFICULTY_LABEL[question.difficulty]}
        </span>
      </div>

      <p className="text-xl sm:text-2xl font-medium leading-snug text-text-primary">
        {question.statement}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onAnswer(true)}
          disabled={disabled}
          aria-label="Verdadeiro"
          className="min-h-[56px] rounded-2xl bg-success/20 border-2 border-success text-success font-bold text-lg transition-all hover:bg-success hover:text-white active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
        >
          Verdadeiro
        </button>
        <button
          onClick={() => onAnswer(false)}
          disabled={disabled}
          aria-label="Falso"
          className="min-h-[56px] rounded-2xl bg-error/20 border-2 border-error text-error font-bold text-lg transition-all hover:bg-error hover:text-white active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
        >
          Falso
        </button>
      </div>
    </motion.div>
  );
}
