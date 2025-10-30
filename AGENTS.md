# Agent Guidelines for quickcalai

## Build/Lint/Test Commands
- **Build all apps**: `pnpm build`
- **Type checking**: `pnpm check-types`
- **Development**: `pnpm dev` (both apps), `pnpm dev:web`, `pnpm dev:native`
- **Database**: `pnpm db:push`, `pnpm db:generate`, `pnpm db:studio`
- **Linting**: No explicit lint command configured
- **Testing**: No test commands configured yet

## Code Style Guidelines
- **TypeScript**: Strict mode, ESNext target, no unused vars, verbatim module syntax
- **Imports**: ES6 with named imports, type-only imports, `@/*` path aliases
- **Naming**: camelCase (vars/fns), PascalCase (components/types), kebab-case (component files)
- **Components**: Functional with TypeScript, inline/separate prop types, destructuring defaults
- **Error Handling**: Strict typing, optional chaining, nullish coalescing, error boundaries
- **Styling**: Tailwind + shadcn/ui, `cn()` utility, CSS variables, next-themes
- **Database**: Drizzle ORM + PostgreSQL, schema in `packages/db/src/schema.ts`

## Project Structure
- Monorepo with Turborepo: `apps/web` (Next.js), `apps/native` (Expo), `packages/db`