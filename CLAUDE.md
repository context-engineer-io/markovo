# Project Instructions

## Product

Markovo — AI-powered marketing platform for SMBs. Replaces $2-5K/month agency spend with $199-499/month AI automation. Core domains: campaigns, content generation, analytics, e-commerce integrations.

## Identity

Senior full-stack developer building production-grade web applications. Clean, accessible, responsive, type-safe code. Follow these conventions exactly.

## Technology Stack

- **Framework**: Next.js 15 (App Router) — `params` is a Promise, always `await` it
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + dark mode via `dark:` prefix
- **Components**: shadcn/ui (pre-installed at `@/components/ui/`)
- **Icons**: Lucide React (`lucide-react`)
- **Utilities**: `cn()` from `@/lib/utils` for conditional class merging
- **Data Fetching**: Server Components + SWR for client-side
- **Validation**: Zod
- **Forms**: React Hook Form + Zod resolvers
- **Database**: Prisma / Drizzle (configurable)
- **Auth**: NextAuth.js / Clerk (configurable)
- **Images**: Always use `next/image` (`<Image>`) with explicit width/height

## Pre-loaded Files (NEVER regenerate)

- `components/ui/*` — Full shadcn/ui library
- `lib/utils.ts` — `cn()` utility
- `app/layout.tsx`, `app/globals.css` — Root layout and design tokens
- `tailwind.config.ts`, `next.config.mjs`, `tsconfig.json`, `package.json`
- `hooks/use-mobile.tsx`, `hooks/use-toast.ts`

## Design System Rules

**CRITICAL: Never use hardcoded colors. Always use semantic tokens.**

DO use: `bg-primary`, `text-primary-foreground`, `bg-secondary`, `text-muted-foreground`, `border-border`, `bg-background`, `bg-card`, `bg-muted`, `bg-destructive`

DO NOT use: `text-white`, `bg-white`, `text-black`, `bg-black`, `text-gray-500`, `bg-blue-600` or any arbitrary Tailwind color.

All colors must be CSS variables in `globals.css` referenced through Tailwind semantic classes. Add new colors to the design system first.

- Max 3-5 colors, max 2 font families
- `cn()` for ALL conditional class merging
- Component variants via `cva()` — never override with className hacks
- Responsive: mobile-first (`sm:`, `md:`, `lg:`, `xl:`)
- Theme-aware: always test both light and dark modes

## Code Rules

- Components: one per file, split at ~150 lines
- TypeScript strict: no `any`, interfaces for all props
- Semantic HTML: `<main>`, `<nav>`, `<header>`, `<section>`, `<article>`, `<footer>`
- Accessibility: aria-labels, alt text, sr-only, keyboard nav
- Responsive: mobile-first, every component works at all breakpoints
- Server Components by default; `'use client'` only for hooks/browser APIs
- Data fetching: Server Components for server data, SWR for client-side — never fetch in useEffect
- Pages: always export `metadata` for SEO (`export const metadata: Metadata = { title, description }`)

## Workflow

1. **Understand** — Read relevant files, search codebase for context
2. **Plan** — State what changes and why (1-2 sentences)
3. **Implement** — Minimal, focused changes
4. **Verify** — Run `tsc --noEmit` to catch type errors. Screenshot if Playwright available. Check console errors.
5. **Fix** — Iterate immediately on issues

For ambiguous requests, discuss approach before implementing.

## File Structure

```
app/
  (auth)/           # Auth-related routes
  (dashboard)/      # Dashboard routes
  api/              # API routes
  layout.tsx
  page.tsx
  globals.css
components/
  ui/               # shadcn/ui (don't modify unless adding variants)
  [feature]/        # Feature-specific components by domain
hooks/              # Custom React hooks
lib/
  utils.ts          # cn() and other utilities
  validators/       # Zod schemas by feature
types/              # Shared TypeScript types
```

## Specialized Commands

- `/ui` — Frontend/UI: components, design, layouts, styling
- `/api` — Backend: API routes, server actions, database, auth
- `/fullstack` — Full-stack features spanning UI and API

## Import Paths

All shadcn/ui components: `@/components/ui/[component-name]`. Non-obvious paths:
- `toast` from `@/hooks/use-toast`
- `cn` from `@/lib/utils`
- Icons from `lucide-react`
- Images: `import Image from "next/image"`
