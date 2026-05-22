"use client";

import { useEffect, useState } from "react";
import type { RankingEntry } from "@/types/quiz";

interface RankingTableProps {
  entries: RankingEntry[];
}

export function RankingTable({ entries }: RankingTableProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // Browser-only API — reading localStorage after mount is the correct pattern here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveId(localStorage.getItem("quiz_session_id"));
  }, []);

  if (entries.length === 0) {
    return (
      <p className="text-text-secondary text-center py-8">
        Nenhuma pontuação registrada ainda. Seja o primeiro!
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-secondary text-left">
            <th className="px-4 py-3 w-10">#</th>
            <th className="px-4 py-3">Nickname</th>
            <th className="px-4 py-3 text-right">Pontos</th>
            <th className="px-4 py-3 text-right">Acertos</th>
            <th className="px-4 py-3 text-right hidden sm:table-cell">Data</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isHighlighted = activeId && entry.id === activeId;
            return (
              <tr
                key={entry.id}
                className={`border-b border-border last:border-0 transition-colors ${
                  isHighlighted
                    ? "bg-accent/10"
                    : "hover:bg-base-card"
                }`}
              >
                <td className="px-4 py-3 font-bold text-text-secondary">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-text-primary">{entry.nickname}</td>
                <td className="px-4 py-3 text-right font-bold text-accent tabular-nums">
                  {entry.score.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                  {entry.correctCount}/15
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell tabular-nums text-text-secondary">
                  {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
