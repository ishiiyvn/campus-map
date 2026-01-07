# Agentic Guidelines

## Commands
- **Dev:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`
- **Type Check:** `pnpm exec tsc --noEmit` (No test runner currently configured)

## Stack & Conventions
- **Framework:** Next.js 15 (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS + Shadcn UI. Use `clsx` and `tailwind-merge` for conditional classes.
- **Database:** Drizzle ORM with Neon (Serverless). Schema in `src/server/db/schema.ts`.
- **Data Fetching:** React Query for client-side, Server Actions (`src/server/actions`) for mutations.
- **Forms:** React Hook Form + Zod + `@hookform/resolvers`.
- **Structure:**
  - Pages in `src/app`.
  - UI components in `src/components/ui`.
  - Feature components in `src/components/<feature>`.
  - Imports: Use absolute paths `@/*` (e.g. `import { Button } from "@/components/ui/button"`).
- **Naming:** PascalCase for components, camelCase for functions/vars, kebab-case for files.
