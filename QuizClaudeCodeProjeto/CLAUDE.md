# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server (localhost:3000)
pnpm build        # production build (must pass with 0 errors/warnings)
pnpm lint         # ESLint check
pnpm test         # unit tests (Jest or Vitest — configure during setup)
pnpm test <file>  # run a single test file
```

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, App Router, TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 — dark mode only |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL + REST) |
| Validation | Zod (all API route bodies) |
| Package manager | pnpm |
| Hosting | Vercel |

## Architecture

**App Router routes:** `/` (home), `/quiz`, `/resultado`, `/ranking`, `/sobre`

**API routes:**
- `POST /api/quiz/start` — generates `sessionId`, selects 15 progressive questions, returns them to the client
- `POST /api/ranking` — receives `{sessionId, nickname, answers[]}`, **recalculates score server-side**, inserts to Supabase
- `GET /api/ranking` — returns top 50, cached 30s

**Question selection** (`lib/questions.ts`): 15 per game — 5 beginner + 6 intermediate + 4 advanced, randomly sampled within each tier using a session seed to avoid consecutive repeats.

**Scoring** (`lib/scoring.ts`):
```
points_base = { beginner: 100, intermediate: 200, advanced: 300 }
time_bonus   = floor((time_remaining_ms / 10000) * 50)
streak_bonus = min(streak * 20, 100)
question_points = points_base + time_bonus + streak_bonus  (correct)
question_points = 0                                         (wrong or timeout)
```
Timer is 10 seconds per question; timeout counts as wrong and advances automatically.

**Question data** (`data/questions.json`): 40 questions total (12 beginner / 18 intermediate / 10 advanced), four categories: `fundamentals`, `features`, `api-sdk`, `best-practices`. Schema:
```json
{
  "id": "q-001",
  "category": "fundamentals",
  "difficulty": "beginner",
  "statement": "...",
  "correctAnswer": true,
  "explanation": "..."
}
```
**Verify every question against official Claude Code / Anthropic docs before committing.** Mark uncertain questions with a `// TODO: revisar` comment.

## Key TypeScript types (`types/quiz.ts`)

```ts
type Difficulty = "beginner" | "intermediate" | "advanced";
type Category   = "fundamentals" | "features" | "api-sdk" | "best-practices";

interface Question     { id, category, difficulty, statement, correctAnswer, explanation }
interface AnswerRecord { questionId, userAnswer: boolean|null, correct, timeSpentMs, pointsEarned }
interface GameSession  { sessionId, startedAt, finishedAt?, questions[], answers[], totalScore, streakMax }
interface RankingEntry { id, nickname, score, correctCount, createdAt }
```

## Supabase table: `rankings`

```sql
create table public.rankings (
  id           uuid primary key default gen_random_uuid(),
  nickname     text not null check (char_length(nickname) between 2 and 20),
  score        integer not null check (score >= 0 and score <= 10000),
  correct_count integer not null check (correct_count between 0 and 15),
  session_id   uuid not null unique,
  ip_hash      text,
  created_at   timestamptz not null default now()
);
```
RLS enabled: public SELECT, no INSERT policy (only `service_role` via server-side API can write).

## Environment variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only — never expose to client
NEXT_PUBLIC_APP_URL=
```
If Supabase env vars are absent, ranking feature must degrade gracefully (fallback to localStorage or hidden UI).

## Security rules

- **Never trust client score.** `/api/ranking` always recalculates from the submitted `answers[]`.
- `SUPABASE_SERVICE_ROLE_KEY` must never appear in any client-side code or `NEXT_PUBLIC_*` variable.
- Rate-limit by IP hash: max 10 ranking submissions per hour.
- `sessionId` is server-generated and stored; reject duplicate submissions.
- All API route inputs validated with Zod before processing.

## Design constraints

- Dark mode only (`#0A0A0A` base, `#CC785C` Anthropic orange accent).
- Mobile-first; test at 375px. Touch targets ≥ 44×44px on V/F buttons.
- WCAG 2.1 AA: contrast ≥ 4.5:1, full keyboard nav, `aria-label` on buttons/timer, respect `prefers-reduced-motion`.
- Fonts: Inter (body) + JetBrains Mono (code inside explanations).
