"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GameSession } from "@/types/quiz";
import { NicknameForm } from "@/components/ranking/NicknameForm";

export default function ResultadoPage() {
  const router = useRouter();
  const [session, setSession] = useState<GameSession | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("quiz_session");
    if (!raw) { router.replace("/"); return; }
    // Browser-only API — reading sessionStorage after mount is the correct pattern here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(JSON.parse(raw));
  }, [router]);

  if (!session) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-text-secondary animate-pulse">Carregando resultado…</p>
      </main>
    );
  }

  const { totalScore, answers, questions, sessionId } = session;
  const correctCount = answers.filter((a) => a.correct).length;
  const pct = Math.round((correctCount / questions.length) * 100);

  const byDifficulty = (d: string) => {
    const qs = questions.filter((q) => q.difficulty === d);
    const correct = answers.filter((a) => {
      const q = qs.find((q) => q.id === a.questionId);
      return q && a.correct;
    }).length;
    return { total: qs.length, correct };
  };

  const beginner = byDifficulty("beginner");
  const intermediate = byDifficulty("intermediate");
  const advanced = byDifficulty("advanced");

  return (
    <main className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full px-4 py-10 gap-8">
      <div className="text-center">
        <p className="text-text-secondary text-sm uppercase tracking-widest mb-2">Pontuação final</p>
        <p className="text-6xl font-bold text-accent tabular-nums">{totalScore.toLocaleString("pt-BR")}</p>
        <p className="text-text-secondary mt-2">{correctCount}/{questions.length} acertos · {pct}%</p>
      </div>

      <div className="w-full bg-base-card rounded-2xl border border-border p-5 flex flex-col gap-4">
        <h2 className="text-text-secondary text-sm font-medium uppercase tracking-widest">Por dificuldade</h2>
        {[
          { label: "Iniciante", data: beginner, color: "text-success" },
          { label: "Intermediário", data: intermediate, color: "text-amber-400" },
          { label: "Avançado", data: advanced, color: "text-error" },
        ].map(({ label, data, color }) => (
          <div key={label} className="flex items-center gap-3">
            <span className={`text-sm font-medium w-28 ${color}`}>{label}</span>
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-current ${color}`}
                style={{ width: `${data.total > 0 ? (data.correct / data.total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-text-secondary text-sm tabular-nums w-10 text-right">
              {data.correct}/{data.total}
            </span>
          </div>
        ))}
      </div>

      {!saved && (
        <div className="w-full bg-base-card rounded-2xl border border-border p-5">
          <h2 className="text-text-primary font-semibold mb-4">Salvar no Ranking Global</h2>
          <NicknameForm sessionId={sessionId} answers={answers} onSuccess={() => setSaved(true)} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href="/quiz"
          className="flex-1 min-h-[48px] flex items-center justify-center rounded-2xl bg-accent text-white font-bold hover:bg-accent-light hover:text-base transition-all"
        >
          Jogar Novamente
        </Link>
        <Link
          href="/ranking"
          className="flex-1 min-h-[48px] flex items-center justify-center rounded-2xl border border-border text-text-secondary hover:border-accent hover:text-accent transition-all"
        >
          Ver Ranking
        </Link>
      </div>
    </main>
  );
}
