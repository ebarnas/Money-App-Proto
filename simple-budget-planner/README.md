# $imple — Budget Planner

A small React + TypeScript budget planner prototype. It includes account/profile screens, income entry, and budget allocation percentages.

## Requirements

- Node.js (LTS)
- pnpm

## Run the app

From this folder, open a terminal and run:

```bash
pnpm install
pnpm dev
```

Open the local address printed in the terminal.

## Create a production build

```bash
pnpm build
pnpm preview
```

## Main files

- `src/BudgetPlannerApp.tsx` — app screens, interactions, and budget calculations.
- `src/budget-planner.css` — app layout and styling.
- `src/main.tsx` — starts the React app.
- `index.html` — page title and browser metadata.
- `vite.config.ts` — Vite and React/Tailwind setup.
- `package.json` and `pnpm-lock.yaml` — dependencies and run commands.
- `public/simple-favicon.svg` — browser icon asset.

## Data note

This prototype stores profile details and budget settings in the browser's `localStorage`. It does not use a secure server-side account system. Do not use a real password or sensitive financial information in this prototype.
