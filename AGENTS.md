# Agent Guidelines for quickcalai

## Build/Lint/Test Commands

- **Build all apps**: `pnpm build`
- **Type checking**: `pnpm check-types`
- **Development server**: `pnpm dev`
- **Web app dev**: `pnpm dev:web`
- **Native app dev**: `pnpm dev:native`
- **Database push schema**: `pnpm db:push`
- **Database generate migrations**: `pnpm db:generate`
- **Database studio**: `pnpm db:studio`

No explicit linting or testing commands configured. Run `pnpm check-types` after changes.

## Code Style Guidelines

### TypeScript Configuration
- Strict TypeScript enabled across all packages
- Target: ESNext modules with bundler resolution
- No unused locals/parameters allowed
- Isolated modules required
- Verbatim module syntax

### Imports and Dependencies
- Use ES6 imports with named imports preferred
- Type-only imports: `import type { TypeName } from 'module'`
- Path aliases: `@/*` maps to `./src/*` (web) or `./*` (native)
- External dependencies: Check existing usage before adding new packages

### Naming Conventions
- **Variables/Functions**: camelCase
- **Components**: PascalCase
- **Types/Interfaces**: PascalCase
- **Files**: kebab-case for components, camelCase for utilities

### Component Patterns
- Use functional components with TypeScript
- Props interface defined inline or as separate type
- Default props via destructuring with defaults
- Export both component and variants (when applicable)

### Error Handling
- Leverage TypeScript's strict typing for compile-time error prevention
- Handle async operations with proper error boundaries
- Use optional chaining and nullish coalescing where appropriate

### Styling
- Tailwind CSS with shadcn/ui components
- CSS variables for theming support
- Utility-first approach with `cn()` helper for class merging
- Dark mode support via next-themes

### Database
- Drizzle ORM with PostgreSQL
- Schema defined in `packages/db/src/schema.ts`
- Generate migrations: `pnpm db:generate`
- Push schema changes: `pnpm db:push`

### Project Structure
- Monorepo with Turborepo
- Apps: `apps/web` (Next.js), `apps/native` (Expo)
- Shared packages: `packages/db`
- Use workspace dependencies where possible