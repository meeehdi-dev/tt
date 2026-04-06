# tt

A sleek, keyboard-centric weekly time-tracking and calendar application built for speed. `tt` helps you block time,
manage projects, and analyze your productivity seamlessly.

## Features

- **Weekly Time Blocking:** Click and drag on the calendar grid to create time slots and log events quickly.
- **Project Management:** Categorize your time with custom color-coded projects.
- **Productivity Insights:** View daily progress indicators and summarize your time spent per project using charts.
- **Highly Customizable:** Adjust your start/end of the day, work day duration, and your preferred start day of the
  week.
- **Keyboard First:** Fully navigable via keyboard shortcuts for minimal friction.
- **Secure & Synced:** Authenticated sessions with database synchronization.

## Keybinds

| Keybind              | Action                               |
| -------------------- | ------------------------------------ |
| `h` / `←`            | Navigate to the previous week        |
| `l` / `→`            | Navigate to the next week            |
| `↑` / `↓`            | Reset calendar to the current week   |
| `r`                  | Open the Summary/Reports modal       |
| `s`                  | Open Settings (General tab)          |
| `p`                  | Open Settings (Projects tab)         |
| `g`                  | Open the project's GitHub repository |
| `Esc`                | Close the active modal               |
| `Cmd/Ctrl` + `Enter` | Save/Submit the current event        |

## Technical Details

Built with a modern, type-safe stack:

- **Framework:** [Nuxt 4](https://nuxt.com/) (Vue 3, Composition API)
- **UI & Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Nuxt UI v4](https://ui.nuxt.com/)
- **State & Utils:** [@vueuse/core](https://vueuse.org/) & Nuxt standard composables
- **Database:** PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **Runtime Validation:** [Zod](https://zod.dev/)
- **Package Manager:** [Bun](https://bun.sh/)

## Local Development

This project uses [Bun](https://bun.sh/) as its package manager.

**1. Install dependencies**

```bash
bun install
```

**2. Database Setup** Generate and run migrations:

```bash
bun run db:generate
bun run db:migrate
```

**3. Start the Development Server** Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

**4. Build for Production**

```bash
bun run build
bun run preview
```
