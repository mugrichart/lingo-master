# lingo-master client

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 + shadcn/ui frontend for lingo-master.

> **Contributing / AI agents:** see the root [AGENTS.md](../AGENTS.md) — especially the server/client boundary rules (never import `lib/data.ts` or `lib/actions.ts` from a `'use client'` component).

## Getting Started

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app talks to the backend via `NEXT_PUBLIC_API_BASE_URL` (see `src/env.ts`). Auth is a `sessionToken` cookie; server components fetch via `src/lib/data.ts` (`getHeaders()` attaches the Bearer token).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
