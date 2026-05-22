import Link from "next/link";

export default function SobrePage() {
  return (
    <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-10 gap-6">
      <h1 className="text-2xl font-bold text-text-primary">Sobre o Projeto</h1>

      <div className="bg-base-card rounded-2xl border border-border p-6 flex flex-col gap-4 text-text-secondary leading-relaxed">
        <p>
          O <strong className="text-text-primary">Claude Code Quiz</strong> é uma ferramenta de aprendizado lúdico para
          desenvolvedores que querem dominar o Claude Code — a CLI oficial da Anthropic para engenharia de software
          assistida por IA.
        </p>
        <p>
          Cada partida apresenta <strong className="text-text-primary">15 perguntas</strong> no formato Verdadeiro ou
          Falso, com dificuldade progressiva (Iniciante → Intermediário → Avançado) e feedback educativo imediato com
          explicações baseadas na documentação oficial.
        </p>
        <p>
          O projeto foi desenvolvido como parte da{" "}
          <strong className="text-text-primary">Trilha Claude da Jornada de Dados</strong>, usando Next.js 15, TypeScript,
          Tailwind CSS 4, Framer Motion e Supabase.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-text-secondary text-sm font-medium uppercase tracking-widest">Referências</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {[
            { label: "Claude Code — Documentação Oficial", href: "https://docs.anthropic.com/en/docs/claude-code/overview" },
            { label: "Anthropic API Docs", href: "https://docs.anthropic.com/" },
            { label: "Agent SDK Overview", href: "https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview" },
          ].map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-light underline transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/" className="text-text-secondary hover:text-accent text-sm transition-colors w-fit">
        ← Voltar ao início
      </Link>
    </main>
  );
}
