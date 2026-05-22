import Link from "next/link";
import type { RankingEntry } from "@/types/quiz";
import { RankingTable } from "@/components/ranking/RankingTable";

async function fetchRanking(): Promise<RankingEntry[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/ranking`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data as { id: string; nickname: string; score: number; correct_count: number; created_at: string }[]).map(
      (r) => ({ id: r.id, nickname: r.nickname, score: r.score, correctCount: r.correct_count, createdAt: r.created_at })
    );
  } catch {
    return [];
  }
}

export default async function RankingPage() {
  const entries = await fetchRanking();

  return (
    <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-10 gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Ranking Global</h1>
        <Link href="/" className="text-text-secondary hover:text-accent text-sm transition-colors">
          ← Início
        </Link>
      </div>

      <RankingTable entries={entries} />

      <div className="flex justify-center">
        <Link
          href="/quiz"
          className="min-h-[48px] px-8 flex items-center justify-center rounded-2xl bg-accent text-white font-bold hover:bg-accent-light hover:text-base transition-all"
        >
          Jogar Agora
        </Link>
      </div>
    </main>
  );
}
