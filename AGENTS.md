# AGENTS.md — lingo-master

Guidance for AI agents and contributors working in this repo. Read this before making changes.

## What this project is
A language-learning app. Users collect vocabulary into nested **topics**, learn words through a guided loop, get **LLM-graded** on definitions/sentences, track **mastery** per topic, and **chat** with AI characters. Monorepo with two apps:
- `backend/` — NestJS + MongoDB (Mongoose) + OpenAI + AWS S3. Port from `PORT` (default 5000).
- `client/` — Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 + shadcn/ui (Radix). Port 3000.

Package manager is **pnpm** (both apps). Run `pnpm start:dev` in `backend/`, `pnpm dev` in `client/`.

## Repo layout
- `backend/src/<feature>/` — feature modules: `topics` (incl. `learning.*`), `words`, `conversations`, `books`, `characters` (chats), `auth`, `users`, `ai-suggestions`, `file-storage`, `config`.
- `client/src/app/(workspaces)/(solo-player)/<route>/` — routes: `topics`, `my-learning`, `chats`, `practice-with-books`.
- `client/src/lib/` — `data.ts` (server-only fetchers), `actions.ts` (`'use server'` mutations), `api-client.ts` (fetch+Zod), `api-schemas.ts` (Zod), `definitions.ts` (TS types), `chat-*` (chat data/types), `mastery.ts` (server-only mastery badge fetcher).
- `client/src/components/ui/` — shadcn/ui primitives.

## Auth
JWT Bearer. Backend: global `AuthGuard` (routes public only via `@Public()`); get the user with `@GetUser('userId')`. Client: server components read the `sessionToken` cookie via `getHeaders()` in `data.ts` (adds `Authorization: Bearer <token>`).

## Key conventions (important — follow these)
- **Server/client boundary**: `client/src/lib/data.ts` and `actions.ts` are **server-only** (import `next/headers`, use inline `'use server'`). **Never import them from a `'use client'` component** — it breaks the Turbopack build ("inline use server / next/headers in Client Component"). For client-side fetching, put fetchers in a dedicated client-safe module (see `lib/chat-client-data.ts`, which omits `next/headers` and relies on the cookie).
- **No functions as props across server→client.** Pass plain serializable data or rendered React nodes. (We hit this with `renderMastery`; mastery is now pre-resolved server-side into a `Record<id, number|null>` and passed down.)
- **Backend validation**: global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` — every DTO field needs a class-validator decorator or the request 400s.
- **Mongoose refs**: type ref props as `Types.ObjectId` (e.g. `creator: Types.ObjectId`), not the entity class. For union/nullable `@Prop`s, pass an explicit `type:` (e.g. `@Prop({ type: Date, default: null })`) or the decorator can't infer the type and throws `CannotDetermineTypeError`.
- **Module wiring**: cross-module service use requires export + import; use `forwardRef` for circular deps (Topics ↔ Words). Register new modules in `app.module.ts`.
- **OpenAI**: `AiSuggestionsService.openaiHandle(model, system, user, structured?)` — JSON mode only applies to `gpt-4o`/`gpt-4o-mini` when the prompt mentions "json". Prompts live in `ai-suggestions/system_prompts.json` + `prompts_generation.service.ts` (add new prompt keys to both and to the `Record<...>` type). Image gen via `images.generate` (`gpt-image-1`).
- **S3**: `FileStorageService.upload(buffer, key, contentType)`; build the public URL as `https://{BUCKET}.s3.{REGION}.amazonaws.com/{key}`.

## Feature notes (recent work)
- **Learn flow** (`/topics/learn?topic=<id>`, `learn/LearnClient.tsx`): per word — show definition → recall it → show example → write a sentence. After every 5th word and at topic end, a checkpoint re-tests the last 5/10; each round is POSTed to `/topics/learning/score` and must be 100% to proceed. Speech-to-text input via `hooks/use-speech-to-text.ts` + `components/speech-textarea.tsx`. Scoring tolerates STT artifacts (see `masteryScoring` prompt).
- **Topic test** (`/topics/test`, `test/TestClient.tsx`): whole-topic definition+sentence quiz, LLM-graded; `persistMastery=true` upserts `Learning.topicLevel`. `GET /topics/learning/mastery/:topic` returns `{ topicLevel, learnedAt }`.
- **Mastery aggregation**: `TopicLearningPlanService.getAggregatedMastery` recurses a topic's own score (only when it has words) + subtopic scores; **branches with words but untested count as 0**, wordless branches are skipped. Cached per node (cache-manager, 10m) and invalidated up the ancestor chain on scored tests, word creation, topic deletion. Route `GET /topics/:id/mastery`.
- **Learned tracking**: `Learning.learnedAt` set when the learn loop completes (`markTopicLearned`). Take Test is gated on learned; My Learning (`/my-learning`) lists learned topics (`GET /topics/learning/my-learning`).
- **Chats/characters** (`/chats`): WhatsApp-style UI. Direct chats are backed by the `characters` module (real, persisted); plot/topic group chats are still **mocked** (`lib/chat-data.ts`). `POST /characters` creates a pending character and asynchronously fills fields + generates the avatar (frontend polls pending ones every 4s). `/add-expertise` command in the chat input attaches a learned topic to a character.

## Validate changes
- Backend: `cd backend && pnpm exec tsc --noEmit -p tsconfig.json` (fast) or `pnpm run build`.
- Client: `cd client && pnpm exec tsc --noEmit`, and `pnpm exec next build` to catch server/client boundary and App Router errors that tsc misses. **Always run the Next build** after touching anything that crosses the server/client boundary.

## Env
`backend/.env`: `PORT`, `MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `AWS_ACCESS_KEY_ID/SECRET_ACCESS_KEY/BUCKET_NAME/REGION`. Client: `NEXT_PUBLIC_API_BASE_URL`.
