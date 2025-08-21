# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Run development server with turbopack (preferred over npm/yarn)
- `pnpm build` - Build production application with turbopack
- `pnpm start` - Start production server
- `pnpm lint` or `eslint` - Run ESLint for code quality checks

## Project Architecture

This is a Next.js 15 application using the App Router architecture with the following structure:

- **Framework**: Next.js 15 with App Router, React 19
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Build Tool**: Turbopack (enabled for both dev and build)
- **Package Manager**: pnpm (evidenced by pnpm-lock.yaml)
- **TypeScript**: Strict mode enabled with path aliases (`@/*` → `./src/*`)

### Key Directories

- `src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist fonts
  - `page.tsx` - Homepage component
- `src/lib/` - Shared utilities
  - `utils.ts` - Contains `cn()` utility for combining Tailwind classes
- `public/` - Static assets (SVG icons)

### UI Component System

The project is configured for shadcn/ui components with:
- New York style variant
- RSC (React Server Components) enabled
- Lucide icons as the icon library
- Component aliases: `@/components`, `@/components/ui`, `@/lib/utils`, etc.

### Build Configuration

- ESLint configured with Next.js TypeScript rules
- Turbopack enabled for faster builds and development
- CSS variables for theming support
- Strict TypeScript configuration with ES2017 target