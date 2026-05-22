import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-12 text-center">
      <div className="flex flex-col items-center gap-4 max-w-xl">
        <span className="text-xs font-mono text-accent uppercase tracking-widest border border-accent/30 rounded-full px-3 py-1">
          Jornada de Dados · Trilha Claude
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
          Claude Code Quiz
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed">
          Teste seus conhecimentos sobre o Claude Code com 15 perguntas de{" "}
          <strong className="text-text-primary">Verdadeiro ou Falso</strong>, dificuldade progressiva
          e feedback educativo em cada resposta.
        </p>
      </div>

      <Link
        href="/quiz"
        className="min-h-[56px] px-10 flex items-center justify-center rounded-2xl bg-accent text-white font-bold text-lg hover:bg-accent-light hover:text-base active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Iniciar Quiz
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Link
          href="/ranking"
          className="bg-base-card border border-border rounded-2xl p-5 text-left hover:border-accent transition-colors group"
        >
          <p className="text-text-secondary text-sm mb-1">🏆</p>
          <p className="font-semibold text-text-primary group-hover:text-accent transition-colors">
            Ver Ranking
          </p>
          <p className="text-text-secondary text-sm mt-1">Top 50 melhores pontuações globais</p>
        </Link>

        <Link
          href="/sobre"
          className="bg-base-card border border-border rounded-2xl p-5 text-left hover:border-accent transition-colors group"
        >
          <p className="text-text-secondary text-sm mb-1">📖</p>
          <p className="font-semibold text-text-primary group-hover:text-accent transition-colors">
            Como Funciona
          </p>
          <p className="text-text-secondary text-sm mt-1">Regras, pontuação e sobre o projeto</p>
        </Link>
      </div>
    </main>
  );
}
