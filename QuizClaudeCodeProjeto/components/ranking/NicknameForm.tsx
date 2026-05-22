"use client";

import { useState } from "react";
import type { AnswerRecord } from "@/types/quiz";

interface NicknameFormProps {
  sessionId: string;
  answers: AnswerRecord[];
  onSuccess: (score: number) => void;
}

export function NicknameForm({ sessionId, answers, onSuccess }: NicknameFormProps) {
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const valid = /^[a-zA-Z0-9_-]{2,20}$/.test(nickname);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, nickname, answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Erro ao salvar.");
        setStatus("error");
      } else {
        setStatus("success");
        localStorage.setItem("quiz_session_id", sessionId);
        onSuccess(data.score);
      }
    } catch {
      setErrorMsg("Erro de rede. Tente novamente.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-success text-center font-medium py-2">
        Pontuação salva no ranking!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="nickname" className="text-text-secondary text-sm font-medium">
        Nickname (2–20 caracteres, letras/números/_/-)
      </label>
      <div className="flex gap-2">
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          placeholder="seu_nick"
          aria-invalid={nickname.length > 0 && !valid}
          className="flex-1 min-h-[44px] rounded-xl border border-border bg-base px-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={!valid || status === "loading"}
          className="min-h-[44px] px-6 rounded-xl bg-accent text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-light hover:text-base transition-all"
        >
          {status === "loading" ? "Salvando…" : "Salvar"}
        </button>
      </div>
      {errorMsg && <p className="text-error text-sm">{errorMsg}</p>}
    </form>
  );
}
