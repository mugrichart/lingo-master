# lingo-master

A language-learning app: collect vocabulary into nested topics, learn words through a guided loop with LLM-graded checkpoints, track per-topic mastery, and chat with AI characters. Monorepo — NestJS API + Next.js client.

> **Contributing / AI agents:** see [AGENTS.md](./AGENTS.md) for architecture, conventions, and feature notes.

## Run the server
```
cd backend
pnpm start:dev
```

## Run the client
```
cd client
pnpm dev
```

The client is Next.js 16 (App Router, port 3000). The server is NestJS + MongoDB (port from `PORT`, default 5000). Both use pnpm.
