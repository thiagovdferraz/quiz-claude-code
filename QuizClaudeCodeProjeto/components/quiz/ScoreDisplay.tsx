"use client";

interface ScoreDisplayProps {
  current: number;
  total: number;
  score: number;
  streak: number;
}

export function ScoreDisplay({ current, total, score, streak }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between text-sm font-medium">
      <span className="text-text-secondary">
        <span className="text-text-primary font-bold">{current}</span>/{total}
      </span>
      <span className="text-accent font-bold tabular-nums">{score.toLocaleString("pt-BR")} pts</span>
      {streak >= 3 ? (
        <span
          aria-label={`Sequência de ${streak} acertos`}
          className="flex items-center gap-1 text-amber-400 font-bold"
        >
          🔥 {streak}
        </span>
      ) : (
        <span aria-label={`Sequência de ${streak} acertos`} className="text-text-secondary">
          ×{streak}
        </span>
      )}
    </div>
  );
}
