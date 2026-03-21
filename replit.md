# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── ecosystem-dashboard/ # React + Vite ecosystem dashboard
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Artifacts

### `artifacts/ecosystem-dashboard` — Project Ecosystem Dashboard

React + Vite frontend served at `/`. Shows the full SpotX ecosystem portfolio.

**Features:**
- Level 1: Master project grid (9 projects) with animated cards
- Level 2: Project drill-down (components per project)
- Level 3: Feature detail modal
- `/spotx` route: Full SpotX TradeBot panel

**SpotX TradeBot panel tabs:**
- **Trade** — Execute buys with live signal, stop-loss/take-profit sliders, price levels
- **Strategy** — Risk engine config (EMA20/50 trend filter, RSI filter, position sizing)
- **P&L History** — Win rate, profit factor, expectancy, trade history
- **Wallet** — SpotX wallet balances + SumUp deposit button

**Dependencies:** `framer-motion`, `clsx`, `tailwind-merge`, `wouter`, `@tanstack/react-query`

### `artifacts/api-server` — Express API Server

**Trade routes (`/api/trade/*`):**
- `GET /trade/tickers` — BTC/ETH/SOL prices (CoinGecko)
- `GET /trade/analyze/:symbol` — EMA20/50, RSI14, trend signal + position sizing
- `POST /trade/execute` — Execute trade (dry-run or live via Binance/ccxt)
- `POST /trade/close/:id` — Close open trade with exit price
- `GET /trade/history` — Full trade history + stats
- `GET /trade/stats` — P&L stats (win rate, profit factor, expectancy)
- `GET /trade/balance` — Binance wallet balance (requires API keys)
- `GET /trade/status` — Connection status (Binance + SumUp)

**Key libraries:**
- `ccxt` — Crypto exchange connectivity (Binance for live trading)
- `protobufjs` — Required peer of ccxt

**Risk Engine (`src/lib/risk-engine.ts`):**
- EMA 20/50 trend filter using CoinGecko historical data
- RSI 14 calculation and overbought/oversold filtering
- Risk-based position sizing (% of account balance)
- P&L tracking: wins/losses, profit factor, expectancy, streak
- In-memory trade history (up to 200 records)

**Trading Engine (`src/lib/tradebot.ts`):**
- Market data via CoinGecko API (30s cache) — Binance is geo-restricted from Replit
- Live order execution via ccxt + Binance (requires API keys)
- Dry-run simulation mode (works without API keys)

## Required Secrets

- `BINANCE_API_KEY` — Binance API key (Spot Trading enabled, Withdrawals disabled)
- `BINANCE_SECRET` — Binance API secret
- `SUMUP_PAYMENT_LINK` — SumUp payment link URL (e.g. `https://pay.sumup.com/b2c/YOUR_ID`)

All secrets are optional — the app runs fully in demo/simulation mode without them.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/`, lib in `src/lib/`.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON, pino-http, routes at `/api`
- `pnpm --filter @workspace/api-server run dev` — dev server

### `artifacts/ecosystem-dashboard` (`@workspace/ecosystem-dashboard`)

React + Vite web app at `/`.

- Entry: `src/main.tsx`
- App: `src/App.tsx` — wouter routing (`/` and `/spotx`)
- Pages: `src/pages/Dashboard.tsx`, `src/pages/SpotXPanel.tsx`
- Components: `src/components/` (Level1Grid, Level2Project, Level3Modal, EcosystemHeader, PriorityBadge)
- Data: `src/lib/data.ts` — all 9 projects with components and features

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. No schema defined yet.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI spec + Orval codegen. Run: `pnpm --filter @workspace/api-spec run codegen`
