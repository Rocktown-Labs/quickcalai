# Agent Guidelines for quickcalai

## Build/Lint/Test Commands
- **Build all apps**: `pnpm build` (runs turbo build across all workspaces)
- **Type checking**: `pnpm check-types` (turbo check-types with strict TS settings)
- **Development**: `pnpm dev` (both apps), `pnpm dev:web`, `pnpm dev:native`
- **Database**: `pnpm db:push`, `pnpm db:generate`, `pnpm db:studio`, `pnpm db:migrate`
- **Linting**: No linting configured yet (turbo task exists but unused)
- **Testing**: No test framework configured yet - add Jest/Vitest when implementing tests

## Code Style Guidelines
- **TypeScript**: Strict mode, ESNext target, verbatim module syntax, no unused locals/parameters, noUncheckedIndexedAccess
- **Imports**: ES6 named imports, type-only imports, `@/*` path aliases, no default exports for components
- **Naming**: camelCase (variables/functions), PascalCase (components/types), kebab-case (files)
- **Components**: Functional React, TypeScript with destructured props, default values in destructuring
- **Error Handling**: Optional chaining (`?.`), nullish coalescing (`??`), error boundaries, strict typing
- **Styling**: Tailwind CSS + shadcn/ui, `cn()` utility for class merging, CSS variables, next-themes
- **Database**: Drizzle ORM + PostgreSQL, relations defined, schema in `packages/db/src/schema.ts`
- **Commits**: Conventional commits (feat/fix/docs/style/refactor/test/chore), descriptive messages

## Project Structure
- Monorepo with Turborepo: `apps/web` (Next.js 16), `apps/native` (Expo), `packages/db` (Drizzle)