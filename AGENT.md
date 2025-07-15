# SynapScale Frontend - Agent Guide

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build 
- `npm run lint` - ESLint check
- `npm test` - Run Jest tests (single test: `npm test -- --testNamePattern="test name"`)
- `npm run test:watch` - Jest watch mode
- `npm run test:coverage` - Coverage report
- `npm run test:e2e` - Cypress E2E tests

## Architecture
Next.js 15 app with TypeScript, Tailwind CSS, and Radix UI components. Key directories:
- `app/` - Next.js App Router pages with route groups: `(auth)/` and `(dashboard)/`
- `components/` - React components (`ui/` for base, `auth/`, `dashboard/`, `common/`)
- `lib/` - Utilities, API client (`lib/api.ts`), config (`lib/config.ts`)
- `context/` - React contexts for state management
- `hooks/` - Custom React hooks
- `types/` - TypeScript definitions
- `tests/` - Jest unit tests

## Code Style (from .cursor-rules.md)
- TypeScript required (.tsx for React components)
- Explicit prop typing with interfaces
- Use `cn()` utility from `lib/utils.ts` for class composition
- Radix UI + class-variance-authority for component variants
- TailwindCSS only - no CSS-in-JS or .css files
- Absolute imports with `@/` prefix
- React.forwardRef + displayName for reusable UI components
- Place UI components in `components/ui/`
