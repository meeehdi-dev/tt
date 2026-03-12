# AI Agents & LLMs Context file (AGENTS.md)

This file contains instructions, project architecture details, styling guidelines, and command references specifically designed to help AI agents (like Claude, Cursor, Copilot) operate correctly and idiomaticly within this codebase.

## 1. Project Overview & Architecture

- **Framework:** Nuxt 4 (Vue 3, Composition API)
- **Language:** strict TypeScript
- **Package Manager:** Bun
- **Styling & UI:** Tailwind CSS v4, Nuxt UI (@nuxt/ui v4)
- **State Management:** Nuxt `useState` or standalone Vue composables (no Pinia)
- **Key Libraries:** `zod` (runtime validation), `dayjs` (date manipulation), `@vueuse/core` (utility functions)

### Directory Structure (Nuxt 4)

This project follows the Nuxt 4 directory structure, meaning all client-side Vue code is namespaced inside the `app/` directory:

- `app/components/`: Reusable Vue UI components
- `app/composables/`: Reusable stateful functions (`useName.ts`)
- `app/pages/`: File-based routing views
- `app/middleware/`: Route middleware for navigation guards
- `app/utils/`: Stateless helper functions
- `app/types/`: Centralized TypeScript interfaces
- `server/api/`: Nitro-powered API endpoints (if applicable)

## 2. CLI Commands (Build, Lint, Test)

### Development, Build, & Execution

- **Install Dependencies:** `bun install`
- **Run Dev Server:** `bun run dev`
- **Typecheck Code:** `bun run typecheck`
- **Build Production App:** `bun run build`
- **Preview Production App:** `bun run preview`

### Linting & Formatting

- **Lint (ESLint):** `bun run lint`
- **Format (Prettier):** `bun run fmt`
  _(Note: Prettier uses `prettier-plugin-tailwindcss` to automatically sort class names)._

### Testing

_Note: This repository currently lacks a configured test runner._
If/when `vitest` is introduced to the repository, tests should be written in a corresponding `tests/` directory or alongside files (`*.spec.ts`).

- **Run All Tests:** `bunx vitest run`
- **Run a Single Test:** `bunx vitest run path/to/file.spec.ts`
- **Run Tests in Watch Mode:** `bunx vitest watch`

## 3. Code Style & Conventions

### Vue Composition API

1. **Script Setup:** Only write Vue code using `<script setup lang="ts">`. The Options API is strictly prohibited.
2. **Auto-imports:** Rely on Nuxt's auto-import feature. Do not add manual import statements for Vue reactivity APIs (`ref`, `computed`, `watch`, `onMounted`) or Nuxt helpers (`useHead`, `useRouter`, `useFetch`). **Never import from `"#imports"`** as all these variables and internal composables are automatically available in the global scope.
3. **Props & Emits:** Use the type-based macro `defineProps<{ ... }>()`. Use `defineEmits<{ (e: 'event', payload: type): void }>()`.

### State Management & Data Fetching

1. **Global State:** For reactive global state, define a composable using Nuxt's `useState<Type>('key', () => init)`.
2. **Data Fetching:** Inside Vue components, rely exclusively on `useAsyncData` or `useFetch` to prevent hydration mismatches. Use `$fetch` for programmatic triggers (e.g., clicking a "Submit" button or inside `server/api/`).

### Authentication & Routing

1. **Route Guards:** Use Nuxt route middleware (`app/middleware/`) for protecting routes. Global middleware (e.g., `auth.global.ts`) automatically applies to all navigations.
2. **Auth State:** Rely on cookies (via Nuxt's `useCookie()`) rather than `localStorage` for authentication tokens. This prevents UI flashing and hydration mismatches during Server-Side Rendering (SSR). Currently, authentication is mocked via a `fake_jwt` cookie using the `useAuth` composable.

### Typing & Validation

1. **TypeScript Everywhere:** Do not use `any`. Use strict typing for function parameters, return types, and props.
2. **Type Definitions:** Centralize domain interfaces and API payloads inside `app/types/`. Import them using `import type { User } from "~/types";`.
3. **Zod:** Ensure that data fetched from external APIs or provided by user form input is validated at runtime using `zod` schemas.

### Naming Conventions

- **Components:** Use `PascalCase.vue` (e.g., `TimeIndicator.vue`, `ProjectList.vue`). Note that `vue/multi-word-component-names` is explicitly disabled in the linter, meaning single-word component names are permitted.
- **Composables:** Use `camelCase`, prefixed with `use` (e.g., `useDate.ts`).
- **Utils & Helpers:** Use `camelCase.ts` or `kebab-case.ts`.
- **Variables & Functions:** `camelCase` for variables and function names. `UPPER_SNAKE_CASE` for global constant arrays/objects.
- **Types/Interfaces:** `PascalCase`. Do not prefix interface names with `I` (e.g., `User` instead of `IUser`).

### Error Handling

1. **Nuxt Error Boundaries:** Use `showError({ statusCode: 404, statusMessage: "Not Found" })` to trigger the application's global error page for fatal client-side issues.
2. **Server API Errors:** In `server/api/`, always throw errors via `createError({ statusCode: ..., statusMessage: ... })` to ensure Nitro returns proper HTTP responses.
3. **Try/Catch Blocks:** Wrap asynchronous logic (`async`/`await`) and Zod parsing operations in `try/catch` blocks. Handle known errors gracefully and use locally scoped `error.value` refs to show in-component feedback if the error shouldn't crash the whole page.

### Styling & UI (Tailwind & Nuxt UI)

1. **Component Library:** Default to using Nuxt UI (`@nuxt/ui`) components (`<UApp>`, `<UButton>`, `<UBadge>`, `<USeparator>`, etc.) to maintain visual consistency.
2. **Utility Classes:** Use Tailwind CSS v4 utility classes extensively inside the `<template>`.
3. **Custom CSS:** Keep custom stylesheet definitions (`app/assets/css/main.css`) to an absolute minimum. Prioritize `@apply` directives or inline Tailwind configurations if complex component styling is needed.

## 4. Cursor / Copilot Rules

_(Note: No `.cursorrules`, `.cursor/rules/`, or `.github/copilot-instructions.md` context exist natively in this repo. If introduced later, consider them extensions to the foundations established in this file.)_
