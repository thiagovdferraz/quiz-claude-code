import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claude Code Quiz",
  description:
    "Teste seus conhecimentos sobre o Claude Code com 15 perguntas Verdadeiro ou Falso.",
  openGraph: {
    title: "Claude Code Quiz",
    description:
      "Teste seus conhecimentos sobre o Claude Code com 15 perguntas Verdadeiro ou Falso.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
