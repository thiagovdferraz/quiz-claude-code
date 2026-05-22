import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-6xl font-bold text-accent">404</p>
      <p className="text-text-secondary">Página não encontrada.</p>
      <Link href="/" className="text-accent hover:text-accent-light underline transition-colors">
        Voltar ao início
      </Link>
    </main>
  );
}
