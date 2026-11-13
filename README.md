# Kos-Kosan Platform (Full-Stack Monorepo)

Production-ready full-stack kos-kosan (boarding house) discovery and management platform.

## Tech Stack
- **Frontend:** SvelteKit (Svelte 5), TypeScript, Tailwind CSS, shadcn-svelte, Lucide icons, TanStack Query
- **Backend:** Bun runtime, Elysia.js, REST API, Zod validation
- **Database:** PostgreSQL (Neon Serverless), Drizzle ORM
- **Deployment:** Vercel (Singapore `sin1`), independent frontend & backend

## Project Structure
```
my-kosan/
├── apps/
│   ├── web/          # SvelteKit discovery portal & admin dashboard
│   └── api/          # Elysia REST backend
├── packages/
│   ├── database/     # Drizzle ORM schema, migrations, Neon connection
│   ├── shared/       # Shared TypeScript types & interfaces
│   └── validators/   # Zod validation schemas
├── package.json
└── README.md
```

## Quick Start
```bash
# 1. Install dependencies
bun install

# 2. Setup database schema & seed data
bun run db:push
bun run db:seed

# 3. Start development servers
bun run dev:api    # Elysia API on port 3001
bun run dev:web    # SvelteKit UI on port 5173
```

